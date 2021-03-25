import type { Group } from '../models';
import { mockMetadata } from './metadata';
import { findMockEntity } from './utils';

describe('findMockEntity', () => {
  it('should return entity at given path', () => {
    expect(findMockEntity('/')).toBe(mockMetadata);
    expect(findMockEntity('/nD_datasets')).toBe(mockMetadata.children[1]);
    expect(findMockEntity('/entities/raw')).toBe(
      (mockMetadata.children[0] as Group).children[3]
    );
  });

  it('should throw if path is relative', () => {
    expect(() => findMockEntity('nD_datasets')).toThrow(
      /path to start with '\/'/
    );
  });

  it('should throw if no entity is found at given path', () => {
    expect(() => findMockEntity('/nD_datasets/foo')).toThrow(/entity at path/);
  });
});
