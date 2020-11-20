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
} from './models';

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

export function isGroup(entity: HDF5Entity): entity is HDF5Group {
  return entity.collection === HDF5Collection.Groups;
}

export function isSimpleShape(shape: HDF5Shape): shape is HDF5SimpleShape {
  return shape.class === HDF5ShapeClass.Simple;
}

export function isScalarShape(shape: HDF5Shape): shape is HDF5ScalarShape {
  return shape.class === HDF5ShapeClass.Scalar;
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
  if (!isNumericType(dataset.type)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertSimpleShape<T extends HDF5Type>(
  dataset: HDF5Dataset<HDF5Shape, T>
): asserts dataset is HDF5Dataset<HDF5SimpleShape, T> {
  const { shape } = dataset;

  if (!isSimpleShape(shape)) {
    throw new Error('Expected dataset to have simple shape');
  }

  if (shape.dims.length === 0) {
    throw new Error('Expected dataset with simple shape to have dimensions');
  }
}

export function getEntity(
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
