import { nanoid } from 'nanoid';
import {
  HDF5Collection,
  HDF5LinkClass,
  HDF5RootLink,
  HDF5Metadata,
  MyHDF5Entity,
  MyHDF5Group,
  MyHDF5Dataset,
  MyHDF5Datatype,
  HDF5HardLink,
  MyHDF5EntityKind,
} from '../providers/models';
import { isGroup, isReachable } from '../providers/utils';

function prepareEntity(
  link: HDF5HardLink | HDF5RootLink,
  parent?: MyHDF5Group
): Omit<MyHDF5Group | MyHDF5Dataset | MyHDF5Datatype, 'kind'> {
  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    parent,
    attributes: [],
    rawLink: link,
  };
}

function buildDataset(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parent?: MyHDF5Group
): MyHDF5Dataset {
  const rawDataset = metadata.datasets![link.id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  return {
    ...prepareEntity(link, parent),
    kind: MyHDF5EntityKind.Dataset,
    attributes: rawDataset.attributes || [],
    shape: rawDataset.shape,
    type: rawDataset.type,
  };
}

function buildDatatype(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parent?: MyHDF5Group
): MyHDF5Datatype {
  const rawDatatype = metadata.datatypes![link.id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  return {
    ...prepareEntity(link, parent),
    kind: MyHDF5EntityKind.Datatype,
    type: rawDatatype.type,
  };
}

function buildGroup(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parent?: MyHDF5Group
): MyHDF5Group {
  const rawGroup = metadata.groups[link.id];

  const group: MyHDF5Group = {
    ...prepareEntity(link, parent),
    kind: MyHDF5EntityKind.Group,
    attributes: rawGroup.attributes || [],
    children: [],
  };

  group.children = (rawGroup.links || []).map((link) => {
    if (!isReachable(link)) {
      return {
        uid: nanoid(),
        name: link.title,
        kind: MyHDF5EntityKind.Link,
        parent: group,
        attributes: [],
        rawLink: link,
      };
    }

    switch (link.collection) {
      case HDF5Collection.Groups:
        return buildGroup(metadata, link, group);
      case HDF5Collection.Datasets:
        return buildDataset(metadata, link, group);
      default:
        return buildDatatype(metadata, link, group);
    }
  });

  return group;
}

export function buildTree(metadata: HDF5Metadata, domain: string): MyHDF5Group {
  const rootLink: HDF5RootLink = {
    class: HDF5LinkClass.Root,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  };

  return buildGroup(metadata, rootLink);
}

export function getEntityAtPath(
  entity: MyHDF5Entity,
  path: number[]
): MyHDF5Entity {
  if (path.length === 0 || !isGroup(entity)) {
    return entity;
  }

  const [nextIndex, ...rest] = path;
  const nextEntity = entity.children[nextIndex];
  return nextEntity ? getEntityAtPath(nextEntity, rest) : entity; // go as far as possible
}

export function getParents(
  entity: MyHDF5Entity,
  prevParents: MyHDF5Group[] = []
): MyHDF5Group[] {
  const { parent } = entity;
  return parent ? getParents(parent, [parent, ...prevParents]) : prevParents;
}

export function findRoot(entity: MyHDF5Entity): MyHDF5Group | undefined {
  if (!entity.parent) {
    return isGroup(entity) ? entity : undefined;
  }

  return findRoot(entity.parent);
}
