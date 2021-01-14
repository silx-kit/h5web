import { Group, Dataset, Datatype, Metadata, EntityKind } from './models';
import {
  HDF5Collection,
  HDF5LinkClass,
  HDF5RootLink,
  HDF5Metadata,
  HDF5Datatype,
  HDF5Dataset,
  HDF5HardLink,
} from './hdf5-models';
import { isReachable } from '../guards';
import { nanoid } from 'nanoid';

function buildDataset(dataset: HDF5Dataset, link: HDF5HardLink): Dataset {
  const { alias, shape, type, attributes = [] } = dataset;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    path: alias[0],
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    rawLink: link,
  };
}

function buildDatatype(datatype: HDF5Datatype, link: HDF5HardLink): Datatype {
  const { alias, type } = datatype;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    path: alias[0],
    kind: EntityKind.Datatype,
    attributes: [],
    type,
    rawLink: link,
  };
}

export function buildGroup(
  metadata: Required<HDF5Metadata>,
  link: HDF5HardLink | HDF5RootLink
): Group {
  const rawGroup = metadata.groups[link.id];
  const { alias, attributes, links } = rawGroup;

  const children = (links || []).map((link) => {
    const childPath = `${alias[0] === '/' ? '' : alias[0]}/${link.title}`;

    if (isReachable(link)) {
      return buildEntity(metadata, link);
    }

    return {
      uid: nanoid(),
      name: link.title,
      path: childPath,
      kind: EntityKind.Link,
      attributes: [],
      rawLink: link,
    };
  });

  const group: Group = {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    path: alias[0],
    kind: EntityKind.Group,
    attributes: attributes || [],
    children,
    rawLink: link,
  };

  group.children.forEach((child) => {
    child.parent = group;
  });

  return group;
}

export function buildEntity(
  metadata: Required<HDF5Metadata>,
  link: HDF5HardLink | HDF5RootLink
): Group | Dataset | Datatype {
  switch (link.collection) {
    case HDF5Collection.Groups:
      return buildGroup(metadata, link);
    case HDF5Collection.Datasets:
      return buildDataset(metadata.datasets[link.id], link);
    case HDF5Collection.Datatypes:
      return buildDatatype(metadata.datatypes[link.id], link);
    default:
      throw new Error('Expected link with known HDF5 collection');
  }
}

export function buildTree(rawMetadata: HDF5Metadata, domain: string): Metadata {
  const metadata = {
    ...rawMetadata,
    datasets: rawMetadata.datasets || {},
    datatypes: rawMetadata.datatypes || {},
  };

  const rootGroup = {
    class: HDF5LinkClass.Root as const,
    collection: HDF5Collection.Groups as const,
    title: domain,
    id: metadata.root,
  };

  return buildGroup(metadata, rootGroup);
}
