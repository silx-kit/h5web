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
import { mockMetadata, mockValues } from './data';

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
  assertAbsolutePath(path);

  const dataset = findMockEntity(mockMetadata, path);
  assertDataset(dataset);
  assertNumericType(dataset);
  assertSimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value.flat(Infinity), dataset.shape.dims);
}
