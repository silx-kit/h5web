import ndarray from 'ndarray';
import type { NdArray } from 'ndarray';
import { isNumber } from 'lodash';
import type { Dataset } from '@h5web/shared';
import { createArrayFromView } from '@h5web/shared';
import { getAttributeValue } from '../../utils';
import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import type { Domain } from '@h5web/lib';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

export function getBaseArray<T extends unknown[] | undefined>(
  value: T,
  rawDims: number[]
): T extends (infer U)[] ? NdArray<U[]> : undefined;

export function getBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): NdArray<T[]> | undefined {
  return value && ndarray(value, rawDims);
}

export function applyMapping<T extends NdArray<unknown[]> | undefined>(
  baseArray: T,
  mapping: (number | Axis | ':')[]
): T extends NdArray<infer U> ? NdArray<U> : undefined;

export function applyMapping<T>(
  baseArray: NdArray<T[]> | undefined,
  mapping: (number | Axis | ':')[]
): NdArray<T[]> | undefined {
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

export function hasImageAttribute(dataset: Dataset): boolean {
  const classAttr = getAttributeValue(dataset, 'CLASS');

  return typeof classAttr === 'string' && classAttr === 'IMAGE';
}
