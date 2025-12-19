import { group, scalar } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { findMockEntity } from './utils';

const mockLeaf = scalar('leaf', 1);
const mockChild = group('child', [mockLeaf]);
const mockGroup = group('root', [mockChild]);

describe('findMockEntity', () => {
  it('should return entity at given path', () => {
    expect(findMockEntity(mockGroup, '/')).toBe(mockGroup);
    expect(findMockEntity(mockGroup, '/child')).toBe(mockChild);
    expect(findMockEntity(mockGroup, '/child/leaf')).toBe(mockLeaf);
  });

  it('should throw if path is relative', () => {
    expect(() => findMockEntity(mockGroup, 'child')).toThrowError(
      /path to start with '\/'/,
    );
  });

  it('should return `undefined` if no entity is found at given path', () => {
    expect(findMockEntity(mockGroup, '/child/unknown')).toBeUndefined();
  });
});
