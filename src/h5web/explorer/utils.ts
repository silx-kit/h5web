import nanoid from 'nanoid';
import { HDF5Collection, HDF5Link } from '../providers/models';
import { Tree } from './models';
import { MockHDF5Metadata } from '../../demo-app/mock-data/models';
import { isHardLink } from '../providers/type-guards';

export function buildTree(
  metadata: MockHDF5Metadata,
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
