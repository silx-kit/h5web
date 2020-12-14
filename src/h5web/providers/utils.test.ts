import { buildTree } from './utils';
import {
  HDF5Collection,
  HDF5RootLink,
  HDF5LinkClass,
  MyHDF5EntityKind,
  MyHDF5Dataset,
  MyHDF5Group,
  MyHDF5Metadata,
} from './models';
import {
  intType,
  makeDataset,
  makeGroup,
  makeHardLink,
  makeMetadata,
  makeStrAttr,
  scalarShape,
} from './raw-utils';

const domain = 'domain';
const rootLink: HDF5RootLink = {
  class: HDF5LinkClass.Root,
  collection: HDF5Collection.Groups,
  title: domain,
  id: '913d8791',
};

describe('Provider utilities', () => {
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
});
