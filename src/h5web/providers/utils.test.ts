import { buildTree } from './utils';
import { EntityKind, Dataset, Group, Metadata } from './models';
import { HDF5Collection, HDF5RootLink, HDF5LinkClass } from './hdf5-models';
import { intType, scalarShape, makeStrAttr } from './mock/utils';

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
      const emptyMetadata = {
        root: '913d8791',
        groups: { '913d8791': {} },
      };

      const expectedTree: Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      expect(buildTree(emptyMetadata, domain)).toEqual(expectedTree);
    });

    it('should process metadata with single dataset in root group', () => {
      const link = {
        class: HDF5LinkClass.Hard as const,
        collection: HDF5Collection.Datasets,
        title: 'foo',
        id: '1203fee7',
      };
      const simpleMetadata = {
        root: '913d8791',
        groups: { '913d8791': { links: [link] } },
        datasets: { '1203fee7': { type: intType, shape: scalarShape } },
      };

      const expectedTree: Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      const expectedChild: Dataset = {
        uid: expect.any(String),
        id: '1203fee7',
        name: link.title,
        kind: EntityKind.Dataset,
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
      const datasetLink = {
        class: HDF5LinkClass.Hard as const,
        collection: HDF5Collection.Datasets,
        title: 'foo',
        id: '1203fee7',
      };

      const groupAttr = makeStrAttr('attr', 'foo');
      const groupLink = {
        class: HDF5LinkClass.Hard as const,
        collection: HDF5Collection.Groups,
        title: 'group',
        id: '0a68caca',
      };

      const nestedMetadata = {
        root: '913d8791',
        groups: {
          '913d8791': { links: [groupLink] },
          '0a68caca': { attributes: [groupAttr], links: [datasetLink] },
        },
        datasets: { '1203fee7': { type: intType, shape: scalarShape } },
      };

      const expectedTree: Metadata = {
        uid: expect.any(String),
        id: '913d8791',
        name: domain,
        kind: EntityKind.Group,
        children: [],
        attributes: [],
        rawLink: rootLink,
      };

      const expectedChildGroup: Group = {
        uid: expect.any(String),
        id: '0a68caca',
        name: 'group',
        kind: EntityKind.Group,
        parent: expectedTree,
        children: [],
        attributes: [groupAttr],
        rawLink: groupLink,
      };

      const expectedChildDataset: Dataset = {
        uid: expect.any(String),
        id: '1203fee7',
        name: 'foo',
        kind: EntityKind.Dataset,
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
