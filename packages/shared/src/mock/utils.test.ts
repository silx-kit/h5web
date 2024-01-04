import { makeMockFile } from './metadata';
import { findMockEntity } from './utils';

const mockFile = makeMockFile();

describe('findMockEntity', () => {
  it('should return entity at given path', () => {
    expect(findMockEntity(mockFile, '/')).toBe(mockFile);
    expect(findMockEntity(mockFile, '/nD_datasets')?.kind).toBe('group');
    expect(findMockEntity(mockFile, '/entities/raw')?.name).toBe('raw');
  });

  it('should throw if path is relative', () => {
    expect(() => findMockEntity(mockFile, 'nD_datasets')).toThrow(
      /path to start with '\/'/,
    );
  });

  it('should return `undefined` if no entity is found at given path', () => {
    expect(findMockEntity(mockFile, '/nD_datasets/foo')).toBeUndefined();
  });
});
