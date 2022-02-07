import type { Domain } from '@h5web/shared';
import { createArrayFromView } from '@h5web/shared';
import { isNumber } from 'lodash';
import type { NdArray, TypedArray } from 'ndarray';
import ndarray from 'ndarray';

import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

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
