import { nanoid } from 'nanoid';
import type { TreeNode } from './models';
import {
  HDF5Collection,
  HDF5Link,
  HDF5LinkClass,
  HDF5RootLink,
  HDF5Metadata,
} from '../providers/models';
import { isReachable } from '../providers/utils';

function buildTreeNode(
  metadata: HDF5Metadata,
  link: HDF5Link,
  parents: HDF5Link[]
): TreeNode<HDF5Link> {
  const group =
    isReachable(link) && link.collection === HDF5Collection.Groups
      ? metadata.groups[link.id]
      : undefined;

  return {
    uid: nanoid(),
    label: link.title,
    data: link,
    parents,
    ...(group
      ? {
          children: (group.links || []).map((lk) =>
            buildTreeNode(metadata, lk, [...parents, link])
          ),
        }
      : {}),
  };
}

export function buildTree(
  metadata: HDF5Metadata,
  domain: string
): TreeNode<HDF5Link> {
  const rootLink: HDF5RootLink = {
    class: HDF5LinkClass.Root,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  };

  return buildTreeNode(metadata, rootLink, []);
}

export function getNodesOnPath<T>(
  tree: TreeNode<T>,
  path: number[]
): TreeNode<T>[] {
  const node = tree.children?.[path[0] ?? -1];
  return node ? [node, ...getNodesOnPath(node, path.slice(1))] : [];
}
