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

const INITIAL_BOUNDS = {
  min: Infinity,
  max: -Infinity,
  positiveMin: Infinity,
  strictPositiveMin: Infinity,
};

/* eslint-disable no-param-reassign */
function mutateBounds(bounds: Bounds, value: number): void {
  const { min, max, positiveMin, strictPositiveMin } = bounds;

  bounds.min = Math.min(value, min);
  bounds.max = Math.max(value, max);
  bounds.positiveMin = value >= 0 ? Math.min(value, positiveMin) : positiveMin;
  bounds.strictPositiveMin =
    value > 0 ? Math.min(value, strictPositiveMin) : strictPositiveMin;
}
/* eslint-enable no-param-reassign */

export function getBounds(
  valuesArray: AnyNumArray,
  ignoreValue?: IgnoreValue,
): Bounds | undefined {
  const values = getValues(valuesArray);
  const valuesBounds = { ...INITIAL_BOUNDS };

  for (const val of values) {
    if (Number.isFinite(val) && !ignoreValue?.(val)) {
      mutateBounds(valuesBounds, val);
    }
  }

  // Return `undefined` bounds if min is still Infinity (i.e. no values or only NaN/Infinity)
  return Number.isFinite(valuesBounds.min) ? valuesBounds : undefined;
}

export function getBoundsWithErrors(
  valuesArray: AnyNumArray,
  errorsArray: AnyNumArray | undefined,
  ignoreValue?: IgnoreValue,
): [
  boundsWithErrors: Bounds | undefined,
  boundsWithoutErrors: Bounds | undefined,
] {
  const values = getValues(valuesArray);
  const errors = errorsArray && getValues(errorsArray);
  assertLength(errorsArray, values.length, 'error');

  const boundsWithErrors = { ...INITIAL_BOUNDS };
  const boundsWithoutErrors = { ...INITIAL_BOUNDS };

  for (const [i, val] of values.entries()) {
    if (!Number.isFinite(val) || ignoreValue?.(val)) {
      continue;
    }

    mutateBounds(boundsWithErrors, val);
    mutateBounds(boundsWithoutErrors, val);

    const err = errors?.[i];
    if (err !== undefined && Number.isFinite(err)) {
      mutateBounds(boundsWithErrors, val - err);
      mutateBounds(boundsWithErrors, val + err);
    }
  }

  // Return `undefined` bounds if min is still Infinity (i.e. no values or only NaN/Infinity)
  return [
    Number.isFinite(boundsWithErrors.min) ? boundsWithErrors : undefined,
    Number.isFinite(boundsWithoutErrors.min) ? boundsWithoutErrors : undefined,
  ];
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType,
): Domain | undefined {
  if (bounds === undefined) {
    return undefined;
  }

  const { min, max, positiveMin, strictPositiveMin } = bounds;

  if (scaleType === ScaleType.Log && min <= 0) {
    return Number.isFinite(strictPositiveMin)
      ? [strictPositiveMin, max] // clamp min to first strictly positive value, if any
      : undefined; // can't make valid domain - e.g. [-5, -2], [-10, 0]
  }

  if (scaleType === ScaleType.Sqrt && min < 0) {
    return Number.isFinite(positiveMin)
      ? [positiveMin, max] // clamp min to first positive value, if any
      : undefined; // can't make valid domain - e.g. [-5, -2]
  }

  return [min, max];
}

export function castArray<T>(arrOrVal: T[] | T): T[] {
  return Array.isArray(arrOrVal) ? arrOrVal : [arrOrVal];
}
