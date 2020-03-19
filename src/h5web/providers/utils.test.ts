import {
  HDF5Collection,
  HDF5LinkClass,
  HDF5RootLink,
  HDF5Metadata,
  HDF5Group,
} from './models';
import { buildTree } from './utils';

const rootLink: HDF5RootLink = {
  class: HDF5LinkClass.Root,
  collection: HDF5Collection.Groups,
  title: '',
  id: '913d8791',
};

describe('Provider utilities', () => {
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

      expect(buildTree(emptyMetadata)).toEqual({
        uid: expect.any(String),
        label: '',
        level: 0,
        data: rootLink,
        children: [],
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

      expect(buildTree(simpleMetadata)).toEqual({
        uid: expect.any(String),
        label: '',
        level: 0,
        data: rootLink,
        children: [
          {
            uid: expect.any(String),
            label: link.title,
            level: 1,
            data: link,
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

      expect(buildTree(nestedMetadata)).toEqual({
        uid: expect.any(String),
        label: '',
        level: 0,
        data: rootLink,
        children: [
          {
            uid: expect.any(String),
            label: link1.title,
            level: 1,
            data: link1,
            children: [
              {
                uid: expect.any(String),
                label: link2.title,
                level: 2,
                data: link2,
              },
            ],
          },
        ],
      });
    });
  });
});
