import { describe, expect, it } from 'vitest';

import {
  buildEntityPath,
  getChildEntity,
  getDimsSize,
  getSelectionSize,
} from './hdf5-utils';
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

describe('getDimsSize', () => {
  it('should return number of elements in dimensions', () => {
    expect(getDimsSize([])).toBe(1);
    expect(getDimsSize([5])).toBe(5);
    expect(getDimsSize([973_350, 3000])).toBe(2_920_050_000);
  });
});

describe('getSelectionSize', () => {
  it('should return number of elements in selection', () => {
    expect(getSelectionSize([2, 3, 4])).toBe(24);
    expect(getSelectionSize([2, 3, 4], '0,:,:')).toBe(12);
    expect(getSelectionSize([2, 3, 4], ':,1,:')).toBe(8);
    expect(getSelectionSize([2, 3, 4], '1,2,3')).toBe(1);
    expect(getSelectionSize([2, 3, 4], '1')).toBe(12);
    expect(getSelectionSize([])).toBe(1);
  });

  it('should return `undefined` for unsupported selections', () => {
    expect(getSelectionSize([10], '0:5')).toBeUndefined();
    expect(getSelectionSize([10], '0,0')).toBeUndefined();
  });
});
