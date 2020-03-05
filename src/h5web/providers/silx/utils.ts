import nanoid from 'nanoid';
import { HDF5Collection, HDF5Link } from '../models';
import { Tree } from '../../explorer/models';
import { isHardLink } from '../type-guards';
import { SilxMetadata } from './models';

export function buildTree(
  metadata: SilxMetadata,
  groupId = metadata.root,
  level = 1
): Tree<HDF5Link> {
  const group = metadata.groups[groupId];
  const { links } = group;

  return (links || []).map(link => ({
    uid: nanoid(),
    label: link.title,
    level,
    data: link,
    ...(isHardLink(link) && link.collection === HDF5Collection.Groups
      ? { children: buildTree(metadata, link.id, level + 1) }
      : {}),
  }));
}
