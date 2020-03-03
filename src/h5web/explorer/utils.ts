import nanoid from 'nanoid';
import { HDF5Metadata, HDF5Collection, HDF5Link } from '../../models/metadata';
import { Tree } from './models';

export function buildTree(
  metadata: HDF5Metadata,
  groupId = metadata.root,
  level = 1
): Tree<HDF5Link> {
  const group = metadata.groups[groupId];
  const { links } = group;

  return (links || []).map(link => {
    const { title, collection, id } = link;
    return {
      uid: nanoid(),
      label: title,
      level,
      data: link,
      ...(collection === HDF5Collection.Groups
        ? { children: buildTree(metadata, id, level + 1) }
        : {}),
    };
  });
}
