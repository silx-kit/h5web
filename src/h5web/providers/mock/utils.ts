import ndarray from 'ndarray';
import {
  assertAbsolutePath,
  assertArray,
  assertDataset,
  assertDefined,
  assertNumericType,
  assertSimpleShape,
  isGroup,
} from '../../guards';
import { getChildEntity } from '../../utils';
import type { Entity, Metadata } from '../models';
import { mockMetadata } from './metadata';
import type { MockDataset } from './models';

function assertMockDataset(entity: Entity): asserts entity is MockDataset {
  assertDataset(entity);
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

export function findMockDataset(path: string): MockDataset {
  const dataset = findMockEntity(mockMetadata, path);
  assertMockDataset(dataset);
  return dataset;
}

export function getMockDataArray(path: string): ndarray {
  const dataset = findMockDataset(path);
  assertNumericType(dataset);
  assertSimpleShape(dataset);

  const { value } = dataset as MockDataset;
  assertArray<number>(value);

  return ndarray(value.flat(Infinity), dataset.shape.dims);
}
