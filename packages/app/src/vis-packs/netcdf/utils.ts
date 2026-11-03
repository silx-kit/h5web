import {
  hasArrayShape,
  hasNumericType,
  isDefined,
  isFloatType,
  isIntegerType,
} from '@h5web/shared/guards';
import {
  type ArrayValue,
  type Dataset,
  type NumericLikeType,
  type NumericType,
  type Shape,
} from '@h5web/shared/hdf5-models';
import { type BigIntTypedArray } from '@h5web/shared/vis-models';

import { type DataContextValue } from '../../providers/DataProvider';
import {
  findAttribute,
  findSingleNumAttr,
  getAttributeValue,
  getSingleNumAttrValue,
} from '../../utils';
import { formatNumLikeType } from '../core/utils';

type IsInvalid = (val: number | bigint) => boolean;

export interface Packing {
  scaleFactor: number;
  addOffset: number;
  type: NumericType; // type of unpacked values
  bigInt?: { scaleFactor: bigint; addOffset: bigint }; // for exact unpacking of 64-bit integers
  isInvalid?: IsInvalid; // checks packed values against fill value and valid range
}

/* Packed values are unpacked with `value * scale_factor + add_offset`.
 * See CF conventions: https://cfconventions.org/cf-conventions/cf-conventions.html#packed-data */
export async function getPacking(
  dataset: Dataset,
  dataContext: DataContextValue,
): Promise<Packing | undefined> {
  if (!hasNumericType(dataset)) {
    return undefined;
  }

  const scaleFactorAttr = findSingleNumAttr(dataset, 'scale_factor');
  const addOffsetAttr = findSingleNumAttr(dataset, 'add_offset');

  if (!scaleFactorAttr && !addOffsetAttr) {
    return undefined;
  }

  const rawScaleFactor = scaleFactorAttr
    ? await getSingleNumAttrValue(dataset, scaleFactorAttr, dataContext)
    : 1;

  const rawAddOffset = addOffsetAttr
    ? await getSingleNumAttrValue(dataset, addOffsetAttr, dataContext)
    : 0;

  const scaleFactor = Number(rawScaleFactor);
  const addOffset = Number(rawAddOffset);

  // Ignore invalid attributes rather than hiding all values
  if (
    scaleFactor === 0 ||
    !Number.isFinite(scaleFactor) ||
    !Number.isFinite(addOffset)
  ) {
    return undefined;
  }

  const attrTypes = [scaleFactorAttr?.type, addOffsetAttr?.type];
  const type = getUnpackedType(attrTypes.filter(isDefined));

  // 64-bit integers don't fit in floats, so unpack them with bigint arithmetic
  const bigInt =
    isIntegerType(type) && type.size === 64 && isIntegerType(dataset.type)
      ? { scaleFactor: BigInt(rawScaleFactor), addOffset: BigInt(rawAddOffset) }
      : undefined;

  const packing: Packing = { scaleFactor, addOffset, type, bigInt };
  const isInvalid = await getIsInvalid(dataset, dataContext, packing);

  return { ...packing, isInvalid };
}

/* Unpacked values have the type of `scale_factor` and `add_offset`.
 * If they differ, pick the widest type, preferring floats over integers. */
export function getUnpackedType(attrTypes: NumericType[]): NumericType {
  const floatTypes = attrTypes.filter(isFloatType);
  const candidates = floatTypes.length > 0 ? floatTypes : attrTypes;
  return candidates.reduce((acc, type) => (type.size > acc.size ? type : acc));
}

function unpackNum(val: number | bigint, packing: Packing): number {
  return Number(val) * packing.scaleFactor + packing.addOffset;
}

function unpackBigInt(
  val: number | bigint,
  bigInt: NonNullable<Packing['bigInt']>,
): bigint {
  return BigInt(val) * bigInt.scaleFactor + bigInt.addOffset;
}

export function unpackValue(
  val: number | bigint,
  packing: Packing,
): number | bigint {
  return packing.bigInt
    ? unpackBigInt(val, packing.bigInt)
    : unpackNum(val, packing);
}

/* Unpack values exactly, including invalid ones (e.g. for display in a table) */
export function unpackArray<T extends ArrayValue | undefined>(
  arr: T,
  packing: Packing | undefined,
): T | Float32Array | Float64Array | BigIntTypedArray {
  if (!arr || !packing) {
    return arr;
  }

  // Packing is only found on datasets with numeric type
  const numArr = arr as ArrayLike<number | bigint>;
  const { type, bigInt } = packing;

  if (bigInt) {
    return isIntegerType(type) && !type.signed
      ? BigUint64Array.from(numArr, (val) => unpackBigInt(val, bigInt))
      : BigInt64Array.from(numArr, (val) => unpackBigInt(val, bigInt));
  }

  return isFloatType(type) && type.size === 32
    ? Float32Array.from(numArr, (val) => unpackNum(val, packing))
    : Float64Array.from(numArr, (val) => unpackNum(val, packing));
}

function unpackToNum(val: number | bigint, packing: Packing): number {
  return packing.isInvalid?.(val)
    ? Number.NaN
    : Number(unpackValue(val, packing));
}

/* Unpack values to numbers for plotting. Invalid values are detected on the exact packed
 * values and replaced with `NaN`, which visualizations render and exclude like ignored values. */
export function unpackNumArray<T extends ArrayValue | undefined>(
  arr: T,
  packing: Packing | undefined,
): T | Float32Array | Float64Array {
  if (!arr || !packing) {
    return arr;
  }

  // Packing is only found on datasets with numeric type
  const numArr = arr as ArrayLike<number | bigint>;

  return isFloatType(packing.type) && packing.type.size === 32
    ? Float32Array.from(numArr, (val) => unpackToNum(val, packing))
    : Float64Array.from(numArr, (val) => unpackToNum(val, packing));
}

/* Priority order: `valid_min` and/or `valid_max`, then `valid_range`, then `_FillValue`.
 * Note that `_FillValue` acts as an invalid upper or lower bound (if positive or negative respectively).
 * See NetCDF `valid_range` convention: https://docs.unidata.ucar.edu/netcdf-c/current/attribute_conventions.html
 *
 * Returned predicate checks stored (i.e. packed) values. `_FillValue` is always in packed units,
 * whereas valid range attributes are in unpacked units if they have the same type as
 * `scale_factor`/`add_offset`, and in packed units otherwise (as in netCDF4-python).
 * Comparisons between bigints and numbers are exact, so values are not converted. */
export async function getIsInvalid(
  dataset: Dataset<Shape, NumericType>,
  dataContext: DataContextValue,
  packing?: Packing,
): Promise<IsInvalid | undefined> {
  const validRange = await getValidRange(dataset, dataContext);

  if (validRange) {
    const { range, type } = validRange;
    const [min, max] = range;

    if (packing && isSameType(type, packing.type)) {
      // Widen float range to absorb rounding errors (integer unpacking is exact)
      const [lower, upper] = isFloatType(type)
        ? [
            Number(min) - getTolerance(Number(min), type),
            Number(max) + getTolerance(Number(max), type),
          ]
        : range;

      return (val) => {
        const unpacked = unpackValue(val, packing);
        return unpacked < lower || unpacked > upper;
      };
    }

    return (val) => val < min || val > max;
  }

  const fillValue = await getFillValue(dataset, dataContext);
  return fillValue !== undefined
    ? createIgnoreFillValue(fillValue, dataset.type)
    : undefined;
}

type Bound = number | bigint;

async function getValidRange(
  dataset: Dataset,
  dataContext: DataContextValue,
): Promise<{ range: [Bound, Bound]; type: NumericType } | undefined> {
  const minAttr = findSingleNumAttr(dataset, 'valid_min');
  const maxAttr = findSingleNumAttr(dataset, 'valid_max');
  const boundAttr = minAttr || maxAttr;

  if (boundAttr) {
    const min = minAttr
      ? await getSingleNumAttrValue(dataset, minAttr, dataContext)
      : -Infinity;

    const max = maxAttr
      ? await getSingleNumAttrValue(dataset, maxAttr, dataContext)
      : Infinity;

    return { range: [min, max], type: boundAttr.type };
  }

  const rangeAttr = findAttribute(dataset, 'valid_range');

  if (rangeAttr && hasArrayShape(rangeAttr) && hasNumericType(rangeAttr)) {
    const range = await getAttributeValue(dataset, rangeAttr, dataContext);

    if (range.length === 2) {
      const [min, max] = range;
      return { range: [min, max], type: rangeAttr.type };
    }
  }

  return undefined;
}

async function getFillValue(
  dataset: Dataset,
  dataContext: DataContextValue,
): Promise<Bound | undefined> {
  const fillValueAttr = findSingleNumAttr(dataset, '_FillValue');

  return fillValueAttr
    ? getSingleNumAttrValue(dataset, fillValueAttr, dataContext)
    : undefined;
}

export function createIgnoreFillValue(
  fillValue: Bound,
  type: NumericType,
): IsInvalid {
  if (isIntegerType(type)) {
    return fillValue < 0
      ? (val) => val <= fillValue
      : (val) => val >= fillValue;
  }

  // Ignore float values that are "close-enough" to the fill value
  const fill = Number(fillValue);
  const tolerance = getTolerance(fill, type);

  return fill < 0
    ? (val) => Number(val) < fill + tolerance
    : (val) => Number(val) > fill - tolerance;
}

export function formatDType(
  type: NumericLikeType,
  packing: Packing | undefined,
): string {
  return packing
    ? `${formatNumLikeType(packing.type)}, unpacked from ${formatNumLikeType(type)}`
    : formatNumLikeType(type);
}

function isSameType(type: NumericType, otherType: NumericType): boolean {
  return (
    type.class === otherType.class &&
    type.size === otherType.size &&
    (!isIntegerType(type) ||
      (isIntegerType(otherType) && type.signed === otherType.signed))
  );
}

// Two epsilons, relative to the magnitude of the value when greater than 1
function getTolerance(val: number, type: NumericType): number {
  return 2 * getEpsilon(type) * Math.max(1, Math.abs(val));
}

// https://en.wikipedia.org/wiki/Machine_epsilon
function getEpsilon(type: NumericType): number {
  if (isFloatType(type) && type.size === 16) {
    return 2 ** -10;
  }

  if (isFloatType(type) && type.size === 32) {
    return 2 ** -23;
  }

  return Number.EPSILON;
}
