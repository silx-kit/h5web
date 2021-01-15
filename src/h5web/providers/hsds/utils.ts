import type {
  HsdsLink,
  HsdsExternalLink,
  HsdsMetadata,
  HsdsDatatype,
  HsdsDataset,
} from './models';
import { Group, Dataset, Datatype, Metadata, EntityKind } from '../models';
import { HDF5Collection, HDF5LinkClass, HDF5HardLink } from '../hdf5-models';
import { isHardLink } from '../../guards';
import { nanoid } from 'nanoid';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}

function buildDataset(dataset: HsdsDataset, link: HDF5HardLink): Dataset {
  const { path, shape, type, attributes = [] } = dataset;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    path,
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    rawLink: link,
  };
}

function buildDatatype(datatype: HsdsDatatype, link: HDF5HardLink): Datatype {
  const { path, type } = datatype;

  return {
    uid: nanoid(),
    id: link.id,
    name: link.title,
    path,
    kind: EntityKind.Datatype,
    attributes: [],
    type,
    rawLink: link,
  };
}

function buildGroup(
  metadata: Required<HsdsMetadata>,
  link: HDF5HardLink
): Group {
  const rawGroup = metadata.groups[link.id];
  const { path, attributes, links } = rawGroup;

  const children = (links || []).map((link) => {
    const childPath = `${path === '/' ? '' : path}/${link.title}`;

    if (isHardLink(link)) {
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
    path,
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
  metadata: Required<HsdsMetadata>,
  link: HDF5HardLink
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

export function buildTree(rawMetadata: HsdsMetadata, domain: string): Metadata {
  const metadata = {
    ...rawMetadata,
    datasets: rawMetadata.datasets || {},
    datatypes: rawMetadata.datatypes || {},
  };

  const rootLink: HDF5HardLink = {
    class: HDF5LinkClass.Hard,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  };

  return buildGroup(metadata, rootLink);
}
