import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import {
  assertAbsolutePath,
  assertArray,
  assertArrayShape,
  assertDataset,
  assertDefined,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
} from '../guards';
import type {
  Attribute,
  Dataset,
  DType,
  ProvidedEntity,
  Shape,
} from '../models-hdf5';
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

export function findMockEntity(path: string): ProvidedEntity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return mockMetadata;
  }

  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
  const parent = findMockEntity(parentPath);
  if (!parent) {
    return undefined;
  }

  assertGroup(parent);
  const childName = path.slice(path.lastIndexOf('/') + 1);
  const child = parent && getChildEntity(parent, childName);

  if (child && isGroup(child)) {
    assertGroupWithChildren(child);
  }
  return child;
}

/*
 * Get a mock dataset's value as an ndarray.
 * Allow type-casting via generic for convenience, as the type of the values is known.
 */
// eslint-disable-next-line etc/no-misused-generics
export function getMockDataArray<T = number>(path: string): NdArray<T[]> {
  const entity = findMockEntity(path);
  assertDefined(entity);
  assertDataset(entity);
  assertMockDataset(entity);

  const { value } = entity;
  assertArray(value);
  assertArrayShape(entity);

  return ndarray(value.flat(entity.shape.length - 1) as T[], entity.shape);
}
