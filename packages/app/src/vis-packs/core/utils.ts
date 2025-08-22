import { type DimensionMapping, type InteractionInfo } from '@h5web/lib';
import {
  isBigIntTypedArray,
  isComplex,
  isIntegerType,
  isNumericType,
} from '@h5web/shared/guards';
import {
  type ArrayValue,
  type ComplexType,
  DTypeClass,
  type H5WebComplex,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import {
  type ComplexLineVisType,
  ComplexVisType,
  type Domain,
  type NumArray,
} from '@h5web/shared/vis-models';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import ndarray, { type NdArray } from 'ndarray';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

export const BASE_INTERACTIONS = [
  { shortcut: 'Drag', description: 'Pan' },
  { shortcut: 'Ctrl+Drag', description: 'Select to zoom' },
  { shortcut: 'Wheel', description: 'Zoom' },
];

export const INTERACTIONS_WITH_AXIAL_ZOOM = [
  ...BASE_INTERACTIONS,
  { shortcut: 'Alt+Wheel', description: 'Zoom in X' },
  { shortcut: 'Shift+Wheel', description: 'Zoom in Y' },
  { shortcut: 'Ctrl+Alt+Drag', description: 'Select to zoom in X' },
  { shortcut: 'Ctrl+Shift+Drag', description: 'Select to zoom in Y' },
];

export function getBaseArray<T extends ArrayValue | undefined>(
  value: T,
  rawDims: number[],
): T extends ArrayValue ? NdArray<T> : undefined;

export function getBaseArray(
  value: ArrayValue | undefined,
  rawDims: number[],
): NdArray<ArrayValue> | undefined {
  return value && ndarray(value, rawDims);
}

export function applyMapping<T extends NdArray<ArrayValue> | undefined>(
  baseArray: T,
  mapping: DimensionMapping,
): T extends NdArray<ArrayValue> ? T : undefined;

export function applyMapping(
  baseArray: NdArray<ArrayValue> | undefined,
  mapping: DimensionMapping,
): NdArray<ArrayValue> | undefined {
  if (!baseArray) {
    return undefined;
  }

  const isXBeforeY =
    mapping.includes('y') &&
    mapping.includes('x') &&
    mapping.indexOf('x') < mapping.indexOf('y');

  const slicingState = mapping.map((val) =>
    typeof val === 'number' ? val : null,
  );

  if (!isXBeforeY && slicingState.every((val) => val === null)) {
    return baseArray; // no mapping/slicing needed
  }

  const slicedView = baseArray.pick(...slicingState);
  const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

  // Create ndarray from mapped view so `mappedArray.data` only contains values relevant to vis
  return createArrayFromView(mappedView);
}

export function getImageInteractions(keepRatio: boolean): InteractionInfo[] {
  return keepRatio ? BASE_INTERACTIONS : INTERACTIONS_WITH_AXIAL_ZOOM;
}

export function isComplexArray(
  val: ArrayValue<NumericLikeType | ComplexType>,
): val is H5WebComplex[] {
  return Array.isArray(val) && isComplex(val[0]);
}

function isBigIntArray(val: ArrayValue<NumericLikeType>): val is bigint[] {
  return Array.isArray(val) && typeof val[0] === 'bigint';
}

function isBoolArray(val: ArrayValue<NumericLikeType>): val is boolean[] {
  return Array.isArray(val) && typeof val[0] === 'boolean';
}

export function toNumArray<
  T extends ArrayValue<NumericLikeType | ComplexType> | undefined,
>(
  arr: T,
  complexVisType?: ComplexLineVisType,
): T extends ArrayValue<NumericLikeType | ComplexType> ? NumArray : undefined;

export function toNumArray(
  arr: ArrayValue<NumericLikeType | ComplexType> | undefined,
  complexVisType: ComplexLineVisType = ComplexVisType.Amplitude,
): NumArray | undefined {
  if (!arr) {
    return undefined;
  }

  if (isComplexArray(arr)) {
    return complexVisType === ComplexVisType.Amplitude
      ? arr.map(([real, imag]) => Math.hypot(real, imag))
      : arr.map(([real, imag]) => Math.atan2(imag, real));
  }

  if (isBigIntTypedArray(arr)) {
    return Float64Array.from(arr, Number); // cast to float 64
  }

  if (isBigIntArray(arr)) {
    return arr.map(Number); // cast to float 64
  }

  if (isBoolArray(arr)) {
    return arr.map((val) => (val ? 1 : 0));
  }

  return arr;
}

const TYPE_STRINGS: Record<NumericLikeType['class'], string> = {
  [DTypeClass.Bool]: 'bool',
  [DTypeClass.Enum]: 'enum',
  [DTypeClass.Integer]: 'int',
  [DTypeClass.Float]: 'float',
};

export function formatNumLikeType(type: NumericLikeType): string {
  const unsignedPrefix = isIntegerType(type) && !type.signed ? 'u' : '';
  const sizeSuffix = isNumericType(type) ? type.size : '';
  return `${unsignedPrefix}${TYPE_STRINGS[type.class]}${sizeSuffix}`;
}
