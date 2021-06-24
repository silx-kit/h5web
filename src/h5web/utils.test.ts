import {
  intType,
  makeGroup,
  makeNxAxesAttr,
  makeScalarDataset,
  makeStrAttr,
} from './providers/mock/metadata-utils';
import { buildEntityPath, getAttributeValue, getChildEntity } from './utils';

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

describe('getAttributeValue', () => {
  const group = makeGroup('group', [], {
    attributes: [
      makeStrAttr('signal', 'my_signal'),
      makeNxAxesAttr(['X']),
      makeStrAttr('CLASS', 'IMAGE'),
    ],
  });

  it("should return an attribute's value", () => {
    expect(getAttributeValue(group, 'signal')).toBe('my_signal');
    expect(getAttributeValue(group, 'axes')).toEqual(['X']);
    expect(getAttributeValue(group, 'CLASS')).toEqual('IMAGE');
  });

  it("should return `undefined` if attribute doesn't exist", () => {
    expect(getAttributeValue(group, 'NX_class')).toBeUndefined();
  });
});
