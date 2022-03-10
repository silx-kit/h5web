import type { Domain } from '@h5web/shared';
import { createArrayFromView } from '@h5web/shared';
import { isNumber } from 'lodash';
import type { NdArray, TypedArray } from 'ndarray';
import ndarray from 'ndarray';

import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import type { Layout } from './heatmap/models';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

const BASE_INTERACTIONS = [
  { shortcut: 'Drag', description: 'Pan' },
  { shortcut: 'Ctrl+Drag', description: 'Select to zoom' },
  { shortcut: 'Wheel', description: 'Zoom' },
];

export const INTERACTIONS_WITH_AXIAL_ZOOM = [
  ...BASE_INTERACTIONS,
  { shortcut: 'Alt+Wheel', description: 'Zoom in X' },
  { shortcut: 'Shift+Wheel', description: 'Zoom in Y' },
];

export function getBaseArray<T, U extends T[] | TypedArray | undefined>(
  value: U,
  rawDims: number[]
): U extends T[] | TypedArray ? NdArray<U> : undefined;

export function getBaseArray<T>(
  value: T[] | TypedArray | undefined,
  rawDims: number[]
) {
  return value && ndarray(value, rawDims);
}

export function applyMapping<
  T,
  U extends NdArray<T[] | TypedArray> | undefined
>(
  baseArray: U,
  mapping: (number | Axis | ':')[]
): U extends NdArray<T[] | TypedArray> ? U : undefined;

export function applyMapping<T>(
  baseArray: NdArray<T[] | TypedArray> | undefined,
  mapping: (number | Axis | ':')[]
) {
  if (!baseArray) {
    return undefined;
  }

  const isXBeforeY =
    mapping.includes('y') &&
    mapping.includes('x') &&
    mapping.indexOf('x') < mapping.indexOf('y');

  const slicingState = mapping.map((val) => (isNumber(val) ? val : null));

  if (!isXBeforeY && slicingState.every((val) => val === null)) {
    return baseArray; // no mapping/slicing needed
  }

  const slicedView = baseArray.pick(...slicingState);
  const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

  // Create ndarray from mapped view so `mappedArray.data` only contains values relevant to vis
  return createArrayFromView(mappedView);
}

export function getSliceSelection(
  dimMapping?: DimensionMapping
): string | undefined {
  if (!dimMapping || !dimMapping.some(isNumber)) {
    return undefined;
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  return dimMapping.map((dim) => (isAxis(dim) ? ':' : dim)).join(',');
}

export function getImageInteractions(layout: Layout) {
  return layout === 'fill' ? INTERACTIONS_WITH_AXIAL_ZOOM : BASE_INTERACTIONS;
}
