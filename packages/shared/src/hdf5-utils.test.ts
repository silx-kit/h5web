import { describe, expect, it } from 'vitest';

import { buildEntityPath, getChildEntity } from './hdf5-utils';
import { group, scalar } from './mock-utils';

describe('getChildEntity', () => {
  const dataset = scalar('dataset', 0);
  const childGroup = group('group');
  const rootGroup = group('root', [childGroup, dataset]);

  it('should return child entity', () => {
    expect(getChildEntity(rootGroup, 'dataset')).toBe(dataset);
    expect(getChildEntity(rootGroup, 'group')).toBe(childGroup);
  });

  it("should return `undefined` if child doesn't exist", () => {
    expect(getChildEntity(childGroup, 'unknown')).toBeUndefined();
  });
});

describe('buildEntityPath', () => {
  it('should build absolute path with entity name', () => {
    expect(buildEntityPath('/', 'group')).toBe('/group');
    expect(buildEntityPath('/foo', 'group')).toBe('/foo/group');
    expect(buildEntityPath('/foo/bar', 'group')).toBe('/foo/bar/group');
  });

  it('should build absolute path with relative path', () => {
    expect(buildEntityPath('/', 'group/dataset')).toBe('/group/dataset');
    expect(buildEntityPath('/foo', 'group/dataset')).toBe('/foo/group/dataset');
  });
});
