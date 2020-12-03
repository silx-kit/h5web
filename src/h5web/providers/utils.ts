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
  HDF5Group,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
  MyHDF5Datatype,
  MyHDF5Dataset,
  MyHDF5Link,
} from './models';

export function isReachable(
  link: HDF5Link
): link is HDF5HardLink | HDF5RootLink {
  // Only hard and root links are considered as reachable for now
  return link.class === HDF5LinkClass.Hard || link.class === HDF5LinkClass.Root;
}

export function isDataset(entity: HDF5Entity): entity is HDF5Dataset {
  return entity.collection === HDF5Collection.Datasets;
}

export function isGroup(entity: HDF5Entity): entity is HDF5Group {
  return entity.collection === HDF5Collection.Groups;
}

export function isMyGroup(entity: MyHDF5Entity): entity is MyHDF5Group {
  return entity.kind === MyHDF5EntityKind.Group;
}

export function isMyDataset(entity: MyHDF5Entity): entity is MyHDF5Dataset {
  return entity.kind === MyHDF5EntityKind.Dataset;
}

export function isMyDatatype(entity: MyHDF5Entity): entity is MyHDF5Datatype {
  return entity.kind === MyHDF5EntityKind.Datatype;
}

export function isMyLink(entity: MyHDF5Entity): entity is MyHDF5Link {
  return entity.kind === MyHDF5EntityKind.Link;
}

export function hasSimpleShape<T extends HDF5Type>(
  dataset: HDF5Dataset<HDF5Shape, T>
): dataset is HDF5Dataset<HDF5SimpleShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Simple;
}

export function hasMySimpleShape<T extends HDF5Type>(
  dataset: MyHDF5Dataset<HDF5Shape, T>
): dataset is MyHDF5Dataset<HDF5SimpleShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Simple;
}

export function hasScalarShape<T extends HDF5Type>(
  dataset: HDF5Dataset<HDF5Shape, T>
): dataset is HDF5Dataset<HDF5ScalarShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Scalar;
}

export function hasBaseType<S extends HDF5Shape>(
  entity: HDF5Dataset<S>
): entity is HDF5Dataset<S, HDF5BaseType> {
  return (
    typeof entity.type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float, HDF5TypeClass.String].includes(
      entity.type.class
    )
  );
}

export function hasNumericType<S extends HDF5Shape>(
  dataset: HDF5Dataset<S>
): dataset is HDF5Dataset<S, HDF5NumericType> {
  return (
    typeof dataset.type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float].includes(dataset.type.class)
  );
}

export function assertDataset(
  entity: HDF5Entity,
  message = 'Expected dataset'
): asserts entity is HDF5Dataset {
  if (!isDataset(entity)) {
    throw new Error(message);
  }
}

export function assertGroup(
  entity: HDF5Entity,
  message = 'Expected group'
): asserts entity is HDF5Group {
  if (!isGroup(entity)) {
    throw new Error(message);
  }
}

export function assertNumericType<S extends HDF5Shape>(
  dataset: HDF5Dataset<S>
): asserts dataset is HDF5Dataset<S, HDF5NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertSimpleShape<T extends HDF5Type>(
  dataset: HDF5Dataset<HDF5Shape, T>
): asserts dataset is HDF5Dataset<HDF5SimpleShape, T> {
  if (!hasSimpleShape(dataset)) {
    throw new Error('Expected dataset to have simple shape');
  }

  if (dataset.shape.dims.length === 0) {
    throw new Error('Expected dataset with simple shape to have dimensions');
  }
}

export function getLink(name: string, group: HDF5Group): HDF5Link | undefined {
  return group.links?.find((l) => l.title === name);
}

function getEntity(
  link: HDF5Link | undefined,
  metadata: HDF5Metadata
): HDF5Entity | undefined {
  if (!link || !isReachable(link)) {
    return undefined;
  }

  const { collection, id } = link;
  const dict = metadata[collection];
  return dict && dict[id];
}

export function getLinkedEntity(
  entityName: string,
  group: HDF5Group,
  metadata: HDF5Metadata
): HDF5Entity | undefined {
  const link = getLink(entityName, group);
  return getEntity(link, metadata);
}
