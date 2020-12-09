import { buildTree, getEntityAtPath } from './utils';
import {
  HDF5Collection,
  HDF5RootLink,
  HDF5LinkClass,
  MyHDF5EntityKind,
  MyHDF5Dataset,
  MyHDF5Group,
} from '../providers/models';
import {
  intType,
  makeDataset,
  makeGroup,
  makeHardLink,
  makeMetadata,
  makeStrAttr,
  scalarShape,
} from '../providers/mock/data';
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
      const rootGroup = makeGroup('913d8791');
      const emptyMetadata = makeMetadata({
        root: '913d8791',
        groups: [rootGroup],
      });

      const expectedTree: MyHDF5Group = {
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
      const dataset = makeDataset('1203fee7', intType, scalarShape);
      const link = makeHardLink(HDF5Collection.Datasets, 'foo', '1203fee7');
      const rootGroup = makeGroup('913d8791', undefined, [link]);

      const simpleMetadata = makeMetadata({
        root: '913d8791',
        groups: [rootGroup],
        datasets: [dataset],
      });

      const expectedTree: MyHDF5Group = {
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
      const dataset = makeDataset('1203fee7', intType, scalarShape);
      const datasetLink = makeHardLink(
        HDF5Collection.Datasets,
        'foo',
        '1203fee7'
      );

      const groupAttr = makeStrAttr('attr', 'foo');
      const group = makeGroup('0a68caca', [groupAttr], [datasetLink]);
      const groupLink = makeHardLink(
        HDF5Collection.Groups,
        'group',
        '0a68caca'
      );

      const rootGroup = makeGroup('913d8791', undefined, [groupLink]);
      const nestedMetadata = makeMetadata({
        root: '913d8791',
        groups: [rootGroup, group],
        datasets: [dataset],
      });

      const expectedTree: MyHDF5Group = {
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
    const group = makeMyGroup('foo', [
      makeMyGroup('bar'),
      makeMyGroup('baz', [dataset]),
    ]);

    it('should return entity at path', () => {
      expect(getEntityAtPath(group, [0]).name).toBe('bar');
      expect(getEntityAtPath(group, [1, 0]).name).toBe('dataset');
    });

    it('should process invalid path as far as possible', () => {
      expect(getEntityAtPath(group, [1, 1]).name).toBe('baz');
    });

    it('should return given entity if path is empty', () => {
      expect(getEntityAtPath(group, [])).toBe(group);
    });

    it('should return given entity if not a group', () => {
      expect(getEntityAtPath(dataset, [0])).toBe(dataset);
    });
  });
});
