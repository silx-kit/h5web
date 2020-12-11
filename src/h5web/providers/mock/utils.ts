import { mockValues, mockMetadata } from './data';
import {
  assertDataset,
  assertMySimpleShape,
  assertNumericType,
} from '../utils';
import { assertArray, assertDefined } from '../../visualizations/shared/utils';
import ndarray from 'ndarray';
import { getEntityAtPath } from '../../explorer/utils';

export function getMockDataArray(path: string): ndarray {
  const dataset = getEntityAtPath(mockMetadata, path);
  assertDefined(dataset, `Expected entity at path "${path}"`);
  assertDataset(dataset, `Expected group at path "${path}"`);
  assertNumericType(dataset);
  assertMySimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value, dataset.shape.dims);
}
