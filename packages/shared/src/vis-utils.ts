import { format } from 'd3-format';
import ndarray, { type NdArray } from 'ndarray';
import { assign } from 'ndarray-ops';

import { assertLength, isNdArray } from './guards';
import {
  type ArrayValue,
  type BooleanType,
  type ComplexType,
  type EnumType,
  type ScalarValue,
} from './hdf5-models';
import {
  type AnyNumArray,
  type AxisScaleType,
  type Bounds,
  type ColorScaleType,
  type Dims,
  type Domain,
  type IgnoreValue,
  type NumArray,
  ScaleType,
  type TypedArrayConstructor,
} from './vis-models';

export const AXIS_SCALE_TYPES: AxisScaleType[] = [
  ScaleType.Linear,
  ScaleType.Log,
  ScaleType.SymLog,
];
export const COLOR_SCALE_TYPES: ColorScaleType[] = [
  ScaleType.Linear,
  ScaleType.Log,
  ScaleType.SymLog,
  ScaleType.Sqrt,
];

export const formatBound = format('.3~e');
export const formatBoundInput = format('.5~e');
export const formatTooltipVal = format('.5~g');
export const formatTooltipErr = format('.3~g');
export const formatScalarComplex = createComplexFormatter(format('.12~g'));

const TICK_PRECISION = 3;
const TICK_DECIMAL_REGEX = /0\.(\d+)$/u; // can start with minus sign
const formatTickAuto = format(`.${TICK_PRECISION}~g`); // automatic mode (`Number.toPrecision`)
const formatTickExp = format(`.${TICK_PRECISION}~e`); // exponent mode

export function formatTick(val: number | { valueOf: () => number }): string {
  const str = formatTickAuto(val);

  /* If automatic mode gives a decimal number with more than three decimals,
   * force exponent notation - e.g. 0.00000123456 => 0.00000123 => 1.235e-6 */
  const match = TICK_DECIMAL_REGEX.exec(str);
  if (match && match[1].length > TICK_PRECISION) {
    return formatTickExp(val);
  }

  return str;
}

export function formatBool(value: ScalarValue<BooleanType>): string {
  return (typeof value === 'number' ? !!value : value).toString();
}

export function createComplexFormatter(
  formatReal: (val: number) => string,
  formatImag = formatReal,
): (val: ScalarValue<ComplexType>) => string {
  return (value) => {
    const [real, imag] = value;
    const sign = Math.sign(imag) >= 0 ? ' + ' : ' − ';
    return `${formatReal(real)}${sign}${formatImag(Math.abs(imag))} i`;
  };
}

export function createEnumFormatter(
  mapping: Record<number, string>,
): (val: ScalarValue<EnumType>) => string {
  return (value) => (value in mapping ? mapping[value] : value.toString());
}

export function getValues(arr: AnyNumArray): NumArray {
  return isNdArray(arr) ? arr.data : arr;
}

export function toTypedNdArray<T extends TypedArrayConstructor>(
  arr: NdArray<NumArray>,
  Constructor: T,
): NdArray<InstanceType<T>> {
  return ndarray(Constructor.from(arr.data) as InstanceType<T>, arr.shape);
}

export function createArrayFromView<T extends ArrayValue>(
  view: NdArray<T>,
): NdArray<T> {
  const { data, size, shape } = view;

  const array = ndarray(
    (Array.isArray(data)
      ? []
      : new (data.constructor as TypedArrayConstructor)(size)) as T,
    shape,
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
  errorArray?: AnyNumArray,
  ignoreValue?: IgnoreValue,
): Bounds | undefined {
  const values = getValues(valuesArray);
  const errors = errorArray && getValues(errorArray);
  assertLength(errorArray, values.length, 'error');

  // @ts-expect-error (https://github.com/microsoft/TypeScript/issues/44593)
  const bounds = values.reduce(
    (acc: Bounds, val: number, i: number) => {
      // Ignore NaN and Infinity from the bounds computation
      if (!Number.isFinite(val) || ignoreValue?.(val)) {
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
    },
  ) as Bounds;

  // Return undefined if min is Infinity (values is empty or contains only NaN/Infinity)
  return Number.isFinite(bounds.min) ? bounds : undefined;
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType,
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

export function castArray<T>(arrOrVal: T[] | T): T[] {
  return Array.isArray(arrOrVal) ? arrOrVal : [arrOrVal];
}
