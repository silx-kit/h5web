import { mockValues, mockMetadata } from './data';
import {
  assertDataset,
  assertMySimpleShape,
  assertNumericType,
  isGroup,
} from '../utils';
import { assertArray, assertDefined } from '../../visualizations/shared/utils';
import ndarray from 'ndarray';
import { MyHDF5Entity } from '../models';
import { getChildEntity } from '../../visualizations/nexus/utils';

export function getMockDataArray(absolutePath: string): ndarray {
  const pathSegments = absolutePath.slice(1).split('/');

  const dataset = pathSegments.reduce<MyHDF5Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    mockMetadata
  );

  assertDefined(dataset, `Expected entity at path "${absolutePath}"`);
  assertDataset(dataset, `Expected group at path "${absolutePath}"`);
  assertNumericType(dataset);
  assertMySimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value, dataset.shape.dims);
}
