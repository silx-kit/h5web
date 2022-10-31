import { format } from 'd3-format';
import ndarray from 'ndarray';
import type { NdArray, TypedArray } from 'ndarray';
import { assign } from 'ndarray-ops';

import { assertLength, isNdArray, isTypedArray } from './guards';
import type {
  ChildEntity,
  GroupWithChildren,
  H5WebComplex,
} from './models-hdf5';
import { ScaleType } from './models-vis';
import type {
  Bounds,
  Domain,
  Dims,
  AnyNumArray,
  NumArray,
  TypedArrayConstructor,
} from './models-vis';

export const formatBound = format('.3~e');
export const formatBoundInput = format('.5~e');
export const formatTooltipVal = format('.5~g');
export const formatTooltipErr = format('.3~g');
export const formatScalarComplex = createComplexFormatter('.12~g');

const TICK_PRECISION = 3;
const TICK_DECIMAL_REGEX = /0\.([0-9]+)$/u; // can start with minus sign
const formatTickAuto = format(`.${TICK_PRECISION}~g`); // automatic mode (`Number.toPrecision`)
const formatTickExp = format(`.${TICK_PRECISION}~e`); // exponent mode

export function formatTick(val: number | { valueOf(): number }): string {
  const str = formatTickAuto(val);

  /* If automatic mode gives a decimal number with more than three decimals,
   * force exponent notation - e.g. 0.00000123456 => 0.00000123 => 1.235e-6 */
  const match = TICK_DECIMAL_REGEX.exec(str);
  if (match && match[1].length > TICK_PRECISION) {
    return formatTickExp(val);
  }

  return str;
}

export function createComplexFormatter(specifier: string, full = false) {
  const formatVal = format(specifier);

  return (value: H5WebComplex) => {
    const [real, imag] = value;

    if (imag === 0 && !full) {
      return `${formatVal(real)}`;
    }

    if (real === 0 && !full) {
      return `${formatVal(imag)} i`;
    }

    const sign = Math.sign(imag) >= 0 ? ' + ' : ' − ';
    return `${formatVal(real)}${sign}${formatVal(Math.abs(imag))} i`;
  };
}

export function getValues(arr: AnyNumArray): NumArray {
  return isNdArray(arr) ? arr.data : arr;
}

export function toTypedNdArray<T extends TypedArrayConstructor>(
  arr: NdArray<NumArray>,
  Constructor: T
): NdArray<InstanceType<T>> {
  return ndarray(Constructor.from(arr.data) as InstanceType<T>, arr.shape);
}

export function getChildEntity(
  group: GroupWithChildren,
  entityName: string
): ChildEntity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function buildEntityPath(
  parentPath: string,
  entityNameOrRelativePath: string
): string {
  const prefix = parentPath === '/' ? '' : parentPath;
  return `${prefix}/${entityNameOrRelativePath}`;
}

export function createArrayFromView<T, U extends TypedArray | T[]>(
  view: NdArray<U>
): NdArray<U> {
  const { data } = view;

  const array = ndarray(
    (isTypedArray(data)
      ? new (data.constructor as TypedArrayConstructor)(view.size)
      : []) as U,
    view.shape
  );

  assign(array, view);
  return array;
}

export function getNewBounds(oldBounds: Bounds, value: number): Bounds {
  const {
    min: oldMin,
    max: oldMax,
    positiveMin: oldPositiveMin,
    strictPositiveMin: oldStrictPositiveMin,
  } = oldBounds;
  return {
    min: Math.min(value, oldMin),
    max: Math.max(value, oldMax),
    positiveMin: value >= 0 ? Math.min(value, oldPositiveMin) : oldPositiveMin,
    strictPositiveMin:
      value > 0 ? Math.min(value, oldStrictPositiveMin) : oldStrictPositiveMin,
  };
}

export function getBounds(
  valuesArray: AnyNumArray,
  errorArray?: AnyNumArray
): Bounds | undefined {
  const values = getValues(valuesArray);
  const errors = errorArray && getValues(errorArray);
  assertLength(errorArray, values.length, 'error');

  // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore (https://github.com/microsoft/TypeScript/issues/44593)
  const bounds = values.reduce(
    (acc: Bounds, val: number, i: number) => {
      // Ignore NaN and Infinity from the bounds computation
      if (!Number.isFinite(val)) {
        return acc;
      }
      const newBounds = getNewBounds(acc, val);
      const err = errors?.[i];
      return err
        ? getNewBounds(getNewBounds(newBounds, val - err), val + err)
        : newBounds;
    },
    {
      min: Infinity,
      max: -Infinity,
      positiveMin: Infinity,
      strictPositiveMin: Infinity,
    }
  );

  // Return undefined if min is Infinity (values is empty or contains only NaN/Infinity)
  return Number.isFinite(bounds.min) ? bounds : undefined;
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType
): Domain | undefined {
  if (bounds === undefined) {
    return undefined;
  }

  const { min, max, positiveMin, strictPositiveMin } = bounds;
  if (scaleType === ScaleType.Log && min * max <= 0) {
    // Clamp domain minimum to first positive value,
    // or return `undefined` if domain is not unsupported: `[-x, 0]`
    return Number.isFinite(strictPositiveMin)
      ? [strictPositiveMin, max]
      : undefined;
  }

  if (scaleType === ScaleType.Sqrt && min * max < 0) {
    return [positiveMin, max];
  }

  return [min, max];
}

export function getDims(dataArray: NdArray): Dims {
  const [rows, cols] = dataArray.shape;
  return { rows, cols };
}
