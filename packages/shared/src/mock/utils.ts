import {
  assertAbsolutePath,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
} from '../guards';
import type {
  Attribute,
  Dataset,
  DType,
  GroupWithChildren,
  ProvidedEntity,
  Shape,
} from '../hdf5-models';
import { getChildEntity } from '../hdf5-utils';
import type { MockAttribute, MockDataset } from './models';

export function assertMockDataset<S extends Shape, T extends DType>(
  dataset: Dataset<S, T>,
): asserts dataset is MockDataset<S, T> {
  if (!('value' in dataset)) {
    throw new Error('Expected mock dataset');
  }
}

export function assertMockAttribute<S extends Shape, T extends DType>(
  attribute: Attribute<S, T>,
): asserts attribute is MockAttribute<S, T> {
  if (!('value' in attribute)) {
    throw new Error('Expected mock attribute');
  }
}

export function findMockEntity(
  group: GroupWithChildren,
  path: string,
): ProvidedEntity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return group;
  }

  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
  const parent = findMockEntity(group, parentPath);
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
