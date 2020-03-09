import nanoid from 'nanoid';
import {
  HDF5Collection,
  HDF5Link,
  HDF5HardLink,
  HDF5LinkClass,
} from '../models';
import { TreeNode } from '../../explorer/models';
import { SilxMetadata } from './models';
import { isHardLink } from '../type-guards';

function buildTreeNode(
  metadata: SilxMetadata,
  link: HDF5Link,
  level = 0
): TreeNode<HDF5Link> {
  const group =
    isHardLink(link) && link.collection === HDF5Collection.Groups
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

export function buildTree(
  metadata: SilxMetadata,
  domain: string
): TreeNode<HDF5Link> {
  const rootLink: HDF5HardLink = {
    class: HDF5LinkClass.Hard,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  };

  return buildTreeNode(metadata, rootLink);
}
