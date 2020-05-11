import { TreeNode } from './models';

export function getNodesOnPath<T>(
  tree: TreeNode<T>,
  path: number[]
): TreeNode<T>[] {
  const node = tree.children?.[path[0] ?? -1];
  return node ? [node, ...getNodesOnPath(node, path.slice(1))] : [];
}
