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
import { isMyGroup, isReachable } from '../providers/utils';

function prepareEntity(
  link: HDF5HardLink | HDF5RootLink,
  parents: MyHDF5Group[]
): Omit<MyHDF5Entity, 'kind'> {
  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    parents,
    attributes: [],
    rawLink: link,
  };
}

function buildDataset(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parents: MyHDF5Group[]
): MyHDF5Dataset {
  const rawDataset = metadata.datasets![link.id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  return {
    ...prepareEntity(link, parents),
    kind: MyHDF5EntityKind.Dataset,
    attributes: rawDataset.attributes || [],
    shape: rawDataset.shape,
    type: rawDataset.type,
    rawEntity: rawDataset,
  };
}

function buildDatatype(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parents: MyHDF5Group[]
): MyHDF5Datatype {
  const rawDatatype = metadata.datatypes![link.id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  return {
    ...prepareEntity(link, parents),
    kind: MyHDF5EntityKind.Datatype,
    type: rawDatatype.type,
    rawEntity: rawDatatype,
  };
}

function buildGroup(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink,
  parents: MyHDF5Group[]
): MyHDF5Group {
  const rawGroup = metadata.groups[link.id];

  const group: MyHDF5Group = {
    ...prepareEntity(link, parents),
    kind: MyHDF5EntityKind.Group,
    attributes: rawGroup.attributes || [],
    children: [],
    rawEntity: rawGroup,
  };

  const newParents = [...parents, group];

  group.children = (rawGroup.links || []).map((link) => {
    if (!isReachable(link)) {
      return {
        uid: nanoid(),
        name: link.title,
        kind: MyHDF5EntityKind.Link,
        parents: newParents,
        attributes: [],
        rawLink: link,
      };
    }

    switch (link.collection) {
      case HDF5Collection.Groups:
        return buildGroup(metadata, link, newParents);
      case HDF5Collection.Datasets:
        return buildDataset(metadata, link, newParents);
      default:
        return buildDatatype(metadata, link, newParents);
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

  return buildGroup(metadata, rootLink, []);
}

export function getEntityAtPath(
  entity: MyHDF5Entity,
  path: number[]
): MyHDF5Entity {
  if (path.length === 0 || !isMyGroup(entity)) {
    return entity;
  }

  const [nextIndex, ...rest] = path;
  const nextEntity = entity.children[nextIndex];
  return nextEntity ? getEntityAtPath(nextEntity, rest) : entity; // go as far as possible
}
