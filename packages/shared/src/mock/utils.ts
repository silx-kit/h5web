import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import {
  assertAbsolutePath,
  isGroup,
  hasChildren,
  assertArray,
  assertArrayShape,
  isDataset,
  assertDefined,
} from '../guards';
import type { Entity } from '../models-hdf5';
import { getChildEntity } from '../utils';
import { mockMetadata } from './metadata';
import type { MockDataset } from './models';

function isMockDataset(entity: Entity): entity is MockDataset {
  return isDataset(entity) && 'value' in entity;
}

export function assertMockDataset(
  entity: Entity
): asserts entity is MockDataset {
  if (!isMockDataset(entity)) {
    throw new Error('Expected mock dataset');
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
  const dataset = findMockEntity(path);
  assertDefined(dataset);
  assertMockDataset(dataset);

  const { value } = dataset;
  assertArray<T>(value);
  assertArrayShape(dataset);

  return ndarray(value.flat(dataset.shape.length - 1) as T[], dataset.shape);
}
