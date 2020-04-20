import nanoid from 'nanoid';
import {
  HDF5Collection,
  HDF5Entity,
  HDF5HardLink,
  HDF5Link,
  HDF5LinkClass,
  HDF5SimpleShape,
  HDF5Shape,
  HDF5ShapeClass,
  HDF5BaseType,
  HDF5Type,
  HDF5TypeClass,
  HDF5RootLink,
  HDF5Metadata,
  HDF5Dataset,
  HDF5ScalarShape,
  HDF5NumericType,
} from './models';
import { TreeNode } from '../explorer/models';

export function isHardLink(link: HDF5Link): link is HDF5HardLink {
  return link.class === HDF5LinkClass.Hard;
}

export function isReachable(
  link: HDF5Link
): link is HDF5HardLink | HDF5RootLink {
  // Only hard and root links are considered as reachable for now
  return link.class === HDF5LinkClass.Hard || link.class === HDF5LinkClass.Root;
}

export function isDataset(entity: HDF5Entity): entity is HDF5Dataset {
  return entity.collection === HDF5Collection.Datasets;
}

export function isSimpleShape(shape: HDF5Shape): shape is HDF5SimpleShape {
  return shape.class === HDF5ShapeClass.Simple;
}

export function isScalarShape(shape: HDF5Shape): shape is HDF5ScalarShape {
  return shape.class === HDF5ShapeClass.Scalar;
}

export function hasSimpleDims(shape: HDF5SimpleShape): boolean {
  const { length: len } = shape.dims;
  return len === 1 || len === 2;
}

export function isBaseType(type: HDF5Type): type is HDF5BaseType {
  return (
    typeof type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float, HDF5TypeClass.String].includes(
      type.class
    )
  );
}

export function isNumericType(type: HDF5Type): type is HDF5NumericType {
  return (
    typeof type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float].includes(type.class)
  );
}

function buildTreeNode(
  metadata: HDF5Metadata,
  link: HDF5Link,
  parents: HDF5Link[],
  level = 0
): TreeNode<HDF5Link> {
  const group =
    isReachable(link) && link.collection === HDF5Collection.Groups
      ? metadata.groups[link.id]
      : undefined;

  return {
    uid: nanoid(),
    label: link.title,
    level,
    data: link,
    parents,
    ...(group
      ? {
          children: (group.links || []).map(lk =>
            buildTreeNode(metadata, lk, [...parents, link], level + 1)
          ),
        }
      : {}),
  };
}

export function buildTree(
  metadata: HDF5Metadata,
  domain: string
): TreeNode<HDF5Link> {
  const rootLink: HDF5RootLink = {
    class: HDF5LinkClass.Root,
    collection: HDF5Collection.Groups,
    title: domain,
    id: metadata.root,
  };

  return buildTreeNode(metadata, rootLink, []);
}
