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
  MyHDF5Metadata,
} from '../providers/models';
import {
  makeMyDataset,
  makeMyDatatype,
  makeMyGroup,
  makeMyLink,
} from '../providers/my-utils';
import { isGroup, isReachable } from '../guards';
import { getChildEntity } from '../visualizations/nexus/utils';

function buildDataset(
  metadata: HDF5Metadata,
  link: HDF5HardLink
): MyHDF5Dataset {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { shape, type, attributes } = metadata.datasets![link.id];

  return makeMyDataset(link.title, shape, type, {
    id: link.id,
    attributes,
    rawLink: link,
  });
}

function buildDatatype(
  metadata: HDF5Metadata,
  link: HDF5HardLink
): MyHDF5Datatype {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { type } = metadata.datatypes![link.id];

  return makeMyDatatype(link.title, type, {
    id: link.id,
    rawLink: link,
  });
}

function buildGroup(
  metadata: HDF5Metadata,
  link: HDF5HardLink | HDF5RootLink
): MyHDF5Group {
  const rawGroup = metadata.groups[link.id];

  const children = (rawGroup.links || []).map((link) => {
    if (!isReachable(link)) {
      return makeMyLink(link);
    }

    switch (link.collection) {
      case HDF5Collection.Groups:
        return buildGroup(metadata, link);
      case HDF5Collection.Datasets:
        return buildDataset(metadata, link);
      case HDF5Collection.Datatypes:
        return buildDatatype(metadata, link);
      default:
        throw new Error('Expected link with known HDF5 collection');
    }
  });

  return makeMyGroup(link.title, children, {
    id: link.id,
    attributes: rawGroup.attributes,
    rawLink: link,
  });
}

export function buildTree(
  metadata: HDF5Metadata,
  domain: string
): MyHDF5Metadata {
  return buildGroup(metadata, {
    class: HDF5LinkClass.Root,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  });
}

function findRoot(entity: MyHDF5Entity): MyHDF5Entity {
  const { parent } = entity;
  return parent ? findRoot(parent) : entity;
}

export function getEntityAtPath(
  baseGroup: MyHDF5Group,
  path: string,
  allowSelf = true
): MyHDF5Entity | undefined {
  const isAbsolutePath = path.startsWith('/');
  const startingGroup = isAbsolutePath ? findRoot(baseGroup) : baseGroup;

  if (path === '/' || path === '') {
    return allowSelf || startingGroup !== baseGroup ? startingGroup : undefined;
  }

  const pathSegments = path.slice(isAbsolutePath ? 1 : 0).split('/');
  return pathSegments.reduce<MyHDF5Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    startingGroup
  );
}

export function getParents(
  entity: MyHDF5Entity,
  prevParents: MyHDF5Group[] = []
): MyHDF5Group[] {
  const { parent } = entity;
  return parent ? getParents(parent, [parent, ...prevParents]) : prevParents;
}
