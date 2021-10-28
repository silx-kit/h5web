import type { Domain, Dataset, AnyArray } from '@h5web/shared';
import { createArrayFromView } from '@h5web/shared';
import { isNumber } from 'lodash';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { getAttributeValue } from '../../utils';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

export function getBaseArray<T extends AnyArray | undefined>(
  value: T,
  rawDims: number[]
): T extends AnyArray ? NdArray<T> : undefined;

export function getBaseArray(
  value: AnyArray | undefined,
  rawDims: number[]
): NdArray<AnyArray> | undefined {
  return value && ndarray(value, rawDims);
}

export function applyMapping<T extends NdArray<AnyArray> | undefined>(
  baseArray: T,
  mapping: (number | Axis | ':')[]
): T extends NdArray<AnyArray> ? T : undefined;

export function applyMapping(
  baseArray: NdArray<AnyArray> | undefined,
  mapping: (number | Axis | ':')[]
): NdArray<AnyArray> | undefined {
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
