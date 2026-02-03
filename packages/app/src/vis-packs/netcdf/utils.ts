import { type IgnoreValue } from '@h5web/lib';
import {
  hasArrayShape,
  hasNumericType,
  isIntegerType,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';

import { type AttrValuesStore } from '../../providers/models';
import {
  findAttribute,
  findScalarNumAttr,
  getAttributeValue,
} from '../../utils';

export function getValidRange(
  dataset: Dataset<ArrayShape, NumericType>,
  attrValuesStore: AttrValuesStore,
): [number, number] | undefined {
  const minAttr = findScalarNumAttr(dataset, 'valid_min');
  const maxAttr = findScalarNumAttr(dataset, 'valid_max');

  if (minAttr || maxAttr) {
    const min = minAttr
      ? getAttributeValue(dataset, minAttr, attrValuesStore)
      : -Infinity;

    const max = maxAttr
      ? getAttributeValue(dataset, maxAttr, attrValuesStore)
      : Infinity;

    return [Number(min), Number(max)];
  }

  const rangeAttr = findAttribute(dataset, 'valid_range');

  if (rangeAttr && hasArrayShape(rangeAttr) && hasNumericType(rangeAttr)) {
    const range = getAttributeValue(dataset, rangeAttr, attrValuesStore);

    if (range.length === 2) {
      const [min, max] = range;
      return [Number(min), Number(max)];
    }
  }

  return undefined;
}

export function getFillValue(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): number | undefined {
  const fillValueAttr = findScalarNumAttr(dataset, '_FillValue');

  return fillValueAttr
    ? Number(getAttributeValue(dataset, fillValueAttr, attrValuesStore))
    : undefined;
}

export function createIgnoreFillValue(
  fillValue: number,
  type: NumericType,
): IgnoreValue {
  if (isIntegerType(type)) {
    return fillValue < 0
      ? (val) => val <= fillValue
      : (val) => val >= fillValue;
  }

  /* Ignore float values that are "close-enough" to the fill value.
   * See NetCDF `valid_range` convention: https://docs.unidata.ucar.edu/netcdf-c/current/attribute_conventions.html */
  const twoEpsilons = 2 * getEpsilon(type.size);

  return fillValue < 0
    ? (val) => val < fillValue || val - fillValue < twoEpsilons
    : (val) => val > fillValue || fillValue - val < twoEpsilons;
}

// https://en.wikipedia.org/wiki/Machine_epsilon
export function getEpsilon(floatSize: number): number {
  if (floatSize === 16) {
    return 2 ** -10;
  }

  if (floatSize === 32) {
    return 2 ** -23;
  }

  return Number.EPSILON;
}
