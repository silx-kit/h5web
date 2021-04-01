import {
  intType,
  makeGroup,
  makeScalarDataset,
} from './providers/mock/metadata-utils';
import { buildEntityPath, getChildEntity } from './utils';

describe('getChildEntity', () => {
  const dataset = makeScalarDataset('dataset', intType);
  const childGroup = makeGroup('group');
  const rootGroup = makeGroup('root', [childGroup, dataset]);

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
