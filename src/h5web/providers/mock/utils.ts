import ndarray, { NdArray } from 'ndarray';
import {
  assertAbsolutePath,
  assertArray,
  assertDefined,
  assertArrayShape,
  isDataset,
  isGroup,
  hasChildren,
} from '../../guards';
import { getChildEntity } from '../../utils';
import { Entity, ProviderError } from '../models';
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

export function findMockEntity(path: string): Entity {
  assertAbsolutePath(path);

  if (path === '/') {
    return mockMetadata;
  }

  const pathSegments = path.slice(1).split('/');
  const entity = pathSegments.reduce<Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity) && hasChildren(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    mockMetadata
  );

  assertDefined(entity, ProviderError.NotFound);
  return entity;
}

export function getMockDataArray<T = number>(path: string): NdArray<T[]> {
  const dataset = findMockEntity(path);
  assertMockDataset(dataset);

  const { value } = dataset;
  assertArray<T>(value);
  assertArrayShape(dataset);

  return ndarray(value.flat(dataset.shape.length - 1) as T[], dataset.shape);
}
