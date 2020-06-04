import { getNodesOnPath } from './utils';
import type { TreeNode } from './models';

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
