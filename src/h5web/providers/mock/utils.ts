import ndarray from 'ndarray';
import {
  assertAbsolutePath,
  assertArray,
  assertDefined,
  assertNumericType,
  assertSimpleShape,
  isDataset,
  isGroup,
} from '../../guards';
import { getChildEntity } from '../../utils';
import type { Entity, Metadata } from '../models';
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

export function findMockEntity(root: Metadata, path: string): Entity {
  assertAbsolutePath(path);

  if (path === '/') {
    return root;
  }

  const pathSegments = path.slice(1).split('/');
  const entity = pathSegments.reduce<Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    root
  );

  assertDefined(entity, `Expected entity at path "${path}"`);
  return entity;
}

export function getMockDataArray(path: string): ndarray {
  const dataset = findMockEntity(mockMetadata, path);
  assertMockDataset(dataset);

  const { value } = dataset;
  assertArray<number>(value);

  assertNumericType(dataset);
  assertSimpleShape(dataset);

  return ndarray(value.flat(Infinity), dataset.shape.dims);
}
