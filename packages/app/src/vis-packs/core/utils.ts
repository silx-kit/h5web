import { isNumericType } from '@h5web/shared/guards';
import type { ArrayValue, NumericLikeType } from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import type { Axis, Domain, NumArray } from '@h5web/shared/vis-models';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import type { NdArray, TypedArray } from 'ndarray';
import ndarray from 'ndarray';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';

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

export function getBaseArray<T extends unknown[] | TypedArray | undefined>(
  value: T,
  rawDims: number[],
): T extends unknown[] | TypedArray ? NdArray<T> : undefined;

export function getBaseArray<T>(
  value: T[] | TypedArray | undefined,
  rawDims: number[],
) {
  return value && ndarray(value, rawDims);
}

export function applyMapping<
  T extends NdArray<unknown[] | TypedArray> | undefined,
>(
  baseArray: T,
  mapping: (number | Axis | ':')[],
): T extends NdArray<unknown[] | TypedArray> ? T : undefined;

export function applyMapping<T>(
  baseArray: NdArray<T[] | TypedArray> | undefined,
  mapping: (number | Axis | ':')[],
) {
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

export function getSliceSelection(
  dimMapping?: DimensionMapping,
): string | undefined {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (!dimMapping || !dimMapping.some((val) => typeof val === 'number')) {
    return undefined;
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  return dimMapping.map((dim) => (isAxis(dim) ? ':' : dim)).join(',');
}

export function getImageInteractions(keepRatio: boolean) {
  return keepRatio ? BASE_INTERACTIONS : INTERACTIONS_WITH_AXIAL_ZOOM;
}

export function toNumArray(arr: ArrayValue<NumericLikeType>): NumArray {
  if (typeof arr[0] === 'boolean') {
    return arr.map((val) => (val ? 1 : 0));
  }

  return arr as NumArray;
}

const TYPE_STRINGS: Record<NumericLikeType['class'], string> = {
  [DTypeClass.Bool]: 'bool',
  [DTypeClass.Enum]: 'enum',
  [DTypeClass.Integer]: 'int',
  [DTypeClass.Unsigned]: 'uint',
  [DTypeClass.Float]: 'float',
};

export function formatNumLikeType(type: NumericLikeType): string {
  return `${TYPE_STRINGS[type.class]}${isNumericType(type) ? type.size : ''}`;
}
