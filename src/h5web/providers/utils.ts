import {
  HDF5Collection,
  HDF5LinkClass,
  HDF5RootLink,
  HDF5Metadata,
  MyHDF5Group,
  MyHDF5Dataset,
  MyHDF5Datatype,
  HDF5HardLink,
  MyHDF5Metadata,
  MyHDF5EntityKind,
  HDF5Datatype,
  HDF5Dataset,
} from './models';
import { isReachable } from '../guards';
import { nanoid } from 'nanoid';

function buildDataset(dataset: HDF5Dataset, link: HDF5HardLink): MyHDF5Dataset {
  const { shape, type, attributes = [] } = dataset;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    kind: MyHDF5EntityKind.Dataset,
    attributes,
    shape,
    type,
    rawLink: link,
  };
}

function buildDatatype(
  datatype: HDF5Datatype,
  link: HDF5HardLink
): MyHDF5Datatype {
  const { type } = datatype;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    kind: MyHDF5EntityKind.Datatype,
    attributes: [],
    type,
    rawLink: link,
  };
}

function buildGroup(
  metadata: Required<HDF5Metadata>,
  link: HDF5HardLink | HDF5RootLink
): MyHDF5Group {
  const rawGroup = metadata.groups[link.id];

  const children = (rawGroup.links || []).map((link) => {
    if (!isReachable(link)) {
      return {
        uid: nanoid(),
        name: link.title,
        kind: MyHDF5EntityKind.Link,
        attributes: [],
        rawLink: link,
      };
    }

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
  });

  const group: MyHDF5Group = {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    kind: MyHDF5EntityKind.Group,
    attributes: rawGroup.attributes || [],
    children,
    rawLink: link,
  };

  group.children.forEach((child) => {
    child.parent = group;
  });

  return group;
}

export function buildTree(
  rawMetadata: HDF5Metadata,
  domain: string
): MyHDF5Metadata {
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
