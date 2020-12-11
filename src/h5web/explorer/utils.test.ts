import { buildTree, getEntityAtPath } from './utils';
import {
  HDF5Collection,
  HDF5RootLink,
  HDF5LinkClass,
  MyHDF5EntityKind,
  MyHDF5Dataset,
  MyHDF5Group,
  MyHDF5Metadata,
} from '../providers/models';
import {
  intType,
  makeDataset,
  makeGroup,
  makeHardLink,
  makeMetadata,
  makeStrAttr,
  scalarShape,
} from '../providers/raw-utils';
import { makeMyDataset, makeMyGroup } from '../providers/my-utils';

const domain = 'domain';
const rootLink: HDF5RootLink = {
  class: HDF5LinkClass.Root,
  collection: HDF5Collection.Groups,
  title: domain,
  id: '913d8791',
};

describe('Explorer utilities', () => {
  describe('buildTree', () => {
    it('should process empty metadata', () => {
      const rootGroup = makeGroup();
      const emptyMetadata = makeMetadata({
        root: '913d8791',
        groups: { '913d8791': rootGroup },
      });

      const expectedTree: MyHDF5Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: MyHDF5EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      expect(buildTree(emptyMetadata, domain)).toEqual(expectedTree);
    });

    it('should process metadata with single dataset in root group', () => {
      const dataset = makeDataset(intType, scalarShape);
      const link = makeHardLink(HDF5Collection.Datasets, 'foo', '1203fee7');
      const rootGroup = makeGroup(undefined, [link]);

      const simpleMetadata = makeMetadata({
        root: '913d8791',
        groups: { '913d8791': rootGroup },
        datasets: { '1203fee7': dataset },
      });

      const expectedTree: MyHDF5Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: MyHDF5EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      const expectedChild: MyHDF5Dataset = {
        uid: expect.any(String),
        id: '1203fee7',
        name: link.title,
        kind: MyHDF5EntityKind.Dataset,
        parent: expectedTree,
        attributes: [],
        shape: scalarShape,
        type: intType,
        rawLink: link,
      };

      expectedTree.children.push(expectedChild);
      expect(buildTree(simpleMetadata, domain)).toEqual(expectedTree);
    });

    it('should process metadata with nested groups', () => {
      const dataset = makeDataset(intType, scalarShape);
      const datasetLink = makeHardLink(
        HDF5Collection.Datasets,
        'foo',
        '1203fee7'
      );

      const groupAttr = makeStrAttr('attr', 'foo');
      const group = makeGroup([groupAttr], [datasetLink]);
      const groupLink = makeHardLink(
        HDF5Collection.Groups,
        'group',
        '0a68caca'
      );

      const rootGroup = makeGroup(undefined, [groupLink]);
      const nestedMetadata = makeMetadata({
        root: '913d8791',
        groups: { '913d8791': rootGroup, '0a68caca': group },
        datasets: { '1203fee7': dataset },
      });

      const expectedTree: MyHDF5Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: MyHDF5EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      const expectedChildGroup: MyHDF5Group = {
        uid: expect.any(String),
        id: '0a68caca',
        name: 'group',
        kind: MyHDF5EntityKind.Group,
        parent: expectedTree,
        children: [],
        attributes: [groupAttr],
        rawLink: groupLink,
      };

      const expectedChildDataset: MyHDF5Dataset = {
        uid: expect.any(String),
        id: '1203fee7',
        name: 'foo',
        kind: MyHDF5EntityKind.Dataset,
        parent: expectedChildGroup,
        attributes: [],
        shape: scalarShape,
        type: intType,
        rawLink: datasetLink,
      };

      expectedTree.children.push(expectedChildGroup);
      expectedChildGroup.children.push(expectedChildDataset);
      expect(buildTree(nestedMetadata, domain)).toEqual(expectedTree);
    });
  });

  describe('getEntityAtPath', () => {
    const dataset = makeMyDataset('dataset', scalarShape, intType);
    const childGroup1 = makeMyGroup('child1');
    const childGroup2 = makeMyGroup('child2', [dataset]);
    const rootGroup = makeMyGroup('root', [childGroup1, childGroup2]);

    it('should process relative path', () => {
      expect(getEntityAtPath(rootGroup, '')).toBe(rootGroup);
      expect(getEntityAtPath(childGroup1, '')).toBe(childGroup1);
      expect(getEntityAtPath(rootGroup, 'child2/dataset')).toBe(dataset);
      expect(getEntityAtPath(childGroup2, 'dataset')).toBe(dataset);
    });

    it('should process absolute path when passed root group', () => {
      expect(getEntityAtPath(rootGroup, '/')).toBe(rootGroup);
      expect(getEntityAtPath(rootGroup, '/child1')).toBe(childGroup1);
      expect(getEntityAtPath(rootGroup, '/child2/dataset')).toBe(dataset);
    });

    it('should process absolute path when passed any child group', () => {
      expect(getEntityAtPath(childGroup1, '/')).toBe(rootGroup);
      expect(getEntityAtPath(childGroup1, '/child1')).toBe(childGroup1);
      expect(getEntityAtPath(childGroup1, '/child2/dataset')).toBe(dataset);
    });

    it('should return `undefined` for invalid paths', () => {
      expect(getEntityAtPath(rootGroup, 'child1/foo')).toBeUndefined();
      expect(getEntityAtPath(rootGroup, '/child1/foo')).toBeUndefined();
      expect(getEntityAtPath(childGroup1, 'foo')).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '/child2/foo')).toBeUndefined();
    });

    it('should support forbidding to retrieve same entity', () => {
      expect(getEntityAtPath(rootGroup, '', false)).toBeUndefined();
      expect(getEntityAtPath(rootGroup, '/', false)).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '', false)).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '/', false)).toBe(rootGroup);
    });
  });
});
