import { getNodesOnPath, buildTree } from './utils';
import type { TreeNode } from './models';
import {
  HDF5Collection,
  HDF5Group,
  HDF5RootLink,
  HDF5LinkClass,
  HDF5Metadata,
} from '../providers/models';

const domain = 'domain';
const rootLink: HDF5RootLink = {
  class: HDF5LinkClass.Root,
  collection: HDF5Collection.Groups,
  title: domain,
  id: '913d8791',
};

const dataA = {};
const dataB = {};
const dataC = {};

const nodeC: TreeNode<{}> = {
  uid: 'c',
  label: 'C',
  data: dataC,
  parents: [dataB],
};

const nodeB: TreeNode<{}> = {
  uid: 'b',
  label: 'B',
  data: dataB,
  children: [nodeC],
  parents: [dataA],
};

const nodeA: TreeNode<{}> = {
  uid: 'a',
  label: 'A',
  data: dataA,
  children: [nodeB],
  parents: [],
};

describe('Explorer utilities', () => {
  describe('buildTree', () => {
    it('should process empty metadata', () => {
      const emptyMetadata = {
        root: '913d8791',
        groups: {
          '913d8791': {
            id: '913d8791',
            collection: HDF5Collection.Groups,
          } as HDF5Group,
        },
      };

      expect(buildTree(emptyMetadata, domain)).toEqual({
        uid: expect.any(String),
        label: domain,
        data: rootLink,
        children: [],
        parents: [],
      });
    });

    it('should process metadata with single dataset in root group', () => {
      const link = {
        class: 'H5L_TYPE_HARD',
        id: '1203fee7',
        title: 'foo',
        collection: 'datasets',
      };

      const simpleMetadata = {
        root: '913d8791',
        groups: {
          '913d8791': {
            id: '913d8791',
            collection: HDF5Collection.Groups,
            links: [link],
          },
        },
      } as HDF5Metadata;

      expect(buildTree(simpleMetadata, domain)).toEqual({
        uid: expect.any(String),
        label: domain,
        data: rootLink,
        parents: [],
        children: [
          {
            uid: expect.any(String),
            label: link.title,
            data: link,
            parents: [rootLink],
          },
        ],
      });
    });

    it('should process metadata with nested groups', () => {
      const link1 = {
        class: 'H5L_TYPE_HARD',
        id: '0a68caca',
        title: 'foo',
        collection: 'groups',
      };

      const link2 = {
        class: 'H5L_TYPE_HARD',
        id: '1203fee7',
        title: 'bar',
        collection: 'datasets',
      };

      const nestedMetadata = {
        root: '913d8791',
        groups: {
          '913d8791': {
            id: '913d8791',
            collection: HDF5Collection.Groups,
            links: [link1],
          },
          '0a68caca': {
            id: '0a68caca',
            collection: HDF5Collection.Groups,
            links: [link2],
          },
        },
      } as HDF5Metadata;

      expect(buildTree(nestedMetadata, domain)).toEqual({
        uid: expect.any(String),
        label: domain,
        data: rootLink,
        parents: [],
        children: [
          {
            uid: expect.any(String),
            label: link1.title,
            data: link1,
            parents: [rootLink],
            children: [
              {
                uid: expect.any(String),
                label: link2.title,
                data: link2,
                parents: [rootLink, link1],
              },
            ],
          },
        ],
      });
    });
  });

  describe('getNodesOnPath', () => {
    it('should return nodes on path', () => {
      expect(getNodesOnPath(nodeA, [])).toEqual([]);
      expect(getNodesOnPath(nodeA, [0])).toEqual([nodeB]);
      expect(getNodesOnPath(nodeA, [0, 0])).toEqual([nodeB, nodeC]);
    });

    it('should process invalid path as far as possible', () => {
      expect(getNodesOnPath(nodeA, [1, 0])).toEqual([]);
      expect(getNodesOnPath(nodeA, [0, 1])).toEqual([nodeB]);
      expect(getNodesOnPath(nodeA, [0, 0, 1])).toEqual([nodeB, nodeC]);
    });
  });
});
