import type {
  ArrayShape,
  ComplexType,
  Dataset,
  Domain,
  NumericType,
} from '@h5web/shared';
import { createArrayFromView, hasComplexType } from '@h5web/shared';
import { isNumber } from 'lodash';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

export function getBaseArray<T, U extends T[] | undefined>(
  value: U,
  rawDims: number[]
): U extends T[] ? NdArray<U> : undefined;

export function getBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): NdArray<T[]> | undefined {
  return value && ndarray(value, rawDims);
}

export function applyMapping<T, U extends NdArray<T[]> | undefined>(
  baseArray: U,
  mapping: (number | Axis | ':')[]
): U extends NdArray<T[]> ? U : undefined;

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

export function getValueSize(
  dataset: Dataset<ArrayShape, NumericType> | Dataset<ArrayShape, ComplexType>
) {
  if (hasComplexType(dataset)) {
    const { type, shape } = dataset;
    return (
      shape.reduce((val, acc) => val * acc) *
      (type.realType.size + type.imagType.size)
    );
  }

  const { type, shape } = dataset;
  return shape.reduce((val, acc) => val * acc) * type.size;
}
