import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import {
  assertAbsolutePath,
  isGroup,
  hasChildren,
  assertArray,
  assertArrayShape,
  assertDefined,
  assertDataset,
} from '../guards';
import type { Attribute, Entity, Dataset, DType, Shape } from '../models-hdf5';
import { getChildEntity } from '../utils';
import { mockMetadata } from './metadata';
import type { MockAttribute, MockDataset } from './models';

export function assertMockDataset<S extends Shape, T extends DType>(
  dataset: Dataset<S, T>
): asserts dataset is MockDataset<S, T> {
  if (!('value' in dataset)) {
    throw new Error('Expected mock dataset');
  }
}

export function assertMockAttribute<S extends Shape, T extends DType>(
  attribute: Attribute<S, T>
): asserts attribute is MockAttribute<S, T> {
  if (!('value' in attribute)) {
    throw new Error('Expected mock attribute');
  }
}

export function findMockEntity(path: string): Entity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return mockMetadata;
  }

  const pathSegments = path.slice(1).split('/');
  return pathSegments.reduce<Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity) && hasChildren(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    mockMetadata
  );
}

export function getMockDataArray<T = number>(path: string): NdArray<T[]> {
  const entity = findMockEntity(path);
  assertDefined(entity);
  assertDataset(entity);
  assertMockDataset(entity);

  const { value } = entity;
  assertArray<T>(value);
  assertArrayShape(entity);

  return ndarray(value.flat(entity.shape.length - 1) as T[], entity.shape);
}
