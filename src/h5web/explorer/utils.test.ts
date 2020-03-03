import { buildTree } from './utils';
import { HDF5Metadata } from '../providers/models';

describe('Explorer Utils', () => {
  describe('buildTree', () => {
    it('should process empty metadata', () => {
      const emptyMetadata = {
        apiVersion: '0.0.0',
        root: '913d8791',
        groups: { '913d8791': {} },
      };

      expect(buildTree(emptyMetadata)).toEqual([]);
    });

    it('should process metadata with single dataset in root group', () => {
      const link = {
        class: 'H5L_TYPE_HARD',
        id: '1203fee7',
        title: 'foo',
        collection: 'datasets',
      };

      const simpleMetadata = {
        apiVersion: '0.0.0',
        root: '913d8791',
        groups: {
          '913d8791': { links: [link] },
        },
      } as HDF5Metadata;

      expect(buildTree(simpleMetadata)).toEqual([
        {
          uid: expect.any(String),
          label: link.title,
          level: 1,
          data: link,
        },
      ]);
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
        apiVersion: '0.0.0',
        root: '913d8791',
        groups: {
          '913d8791': { links: [link1] },
          '0a68caca': { links: [link2] },
        },
      } as HDF5Metadata;

      expect(buildTree(nestedMetadata)).toEqual([
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
      ]);
    });
  });
});
