import nanoid from 'nanoid';
import {
  HDF5Collection,
  HDF5Link,
  HDF5RootLink,
  HDF5LinkClass,
} from '../models';
import { TreeNode } from '../../explorer/models';
import { SilxMetadata } from './models';
import { isReachable } from '../type-guards';

function buildTreeNode(
  metadata: SilxMetadata,
  link: HDF5Link,
  level = 0
): TreeNode<HDF5Link> {
  const group =
    isReachable(link) && link.collection === HDF5Collection.Groups
      ? metadata.groups[link.id]
      : undefined;

  return {
    uid: nanoid(),
    label: link.title,
    level,
    data: link,
    ...(group
      ? {
          children: (group.links || []).map(lk =>
            buildTreeNode(metadata, lk, level + 1)
          ),
        }
      : {}),
  };
}

export function buildTree(metadata: SilxMetadata): TreeNode<HDF5Link> {
  const rootLink: HDF5RootLink = {
    class: HDF5LinkClass.Root,
    collection: HDF5Collection.Groups,
    title: '',
    id: metadata.root,
  };

  return buildTreeNode(metadata, rootLink);
}
