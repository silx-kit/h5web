import { ProviderError } from '../models';
import { mockMetadata } from './metadata';
import { findMockEntity } from './utils';

describe('findMockEntity', () => {
  it('should return entity at given path', () => {
    expect(findMockEntity('/')).toBe(mockMetadata);
    expect(findMockEntity('/nD_datasets').kind).toBe('group');
    expect(findMockEntity('/entities/raw').name).toBe('raw');
  });

  it('should throw if path is relative', () => {
    expect(() => findMockEntity('nD_datasets')).toThrow(
      /path to start with '\/'/
    );
  });

  it('should throw if no entity is found at given path', () => {
    expect(() => findMockEntity('/nD_datasets/foo')).toThrow(
      ProviderError.NotFound
    );
  });
});
