import {
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
  HDF5ScalarShape,
  HDF5NumericType,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
  MyHDF5Datatype,
  MyHDF5Dataset,
  MyHDF5Link,
  MyHDF5ResolvedEntity,
} from './providers/models';

export function assertDefined<T>(
  val: T,
  message = 'Expected some value'
): asserts val is NonNullable<T> {
  if (val === undefined) {
    throw new TypeError(message);
  }
}

export function assertStr(
  val: unknown,
  message = 'Expected string'
): asserts val is string {
  if (typeof val !== 'string') {
    throw new TypeError(message);
  }
}

export function assertNumOrStr(val: unknown): asserts val is number | string {
  if (typeof val !== 'number' && typeof val !== 'string') {
    throw new TypeError('Expected number or string');
  }
}

export function assertArray<T>(val: unknown): asserts val is T[] {
  if (!Array.isArray(val)) {
    throw new TypeError('Expected array');
  }
}

export function assertOptionalArray<T>(
  val: unknown
): asserts val is T[] | undefined {
  if (val !== undefined) {
    assertArray<T>(val);
  }
}

export function isResolved(
  entity: MyHDF5Entity
): entity is MyHDF5ResolvedEntity {
  return 'id' in entity;
}

export function isGroup(entity: MyHDF5Entity): entity is MyHDF5Group {
  return entity.kind === MyHDF5EntityKind.Group;
}

export function isDataset(entity: MyHDF5Entity): entity is MyHDF5Dataset {
  return entity.kind === MyHDF5EntityKind.Dataset;
}

export function isDatatype(entity: MyHDF5Entity): entity is MyHDF5Datatype {
  return entity.kind === MyHDF5EntityKind.Datatype;
}

export function isLink(entity: MyHDF5Entity): entity is MyHDF5Link {
  return entity.kind === MyHDF5EntityKind.Link;
}

export function isReachable(
  link: HDF5Link
): link is HDF5HardLink | HDF5RootLink {
  // Only hard and root links are considered as reachable for now
  return link.class === HDF5LinkClass.Hard || link.class === HDF5LinkClass.Root;
}

export function hasSimpleShape<T extends HDF5Type>(
  dataset: MyHDF5Dataset<HDF5Shape, T>
): dataset is MyHDF5Dataset<HDF5SimpleShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Simple;
}

export function hasScalarShape<T extends HDF5Type>(
  dataset: MyHDF5Dataset<HDF5Shape, T>
): dataset is MyHDF5Dataset<HDF5ScalarShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Scalar;
}

export function hasBaseType<S extends HDF5Shape>(
  entity: MyHDF5Dataset<S>
): entity is MyHDF5Dataset<S, HDF5BaseType> {
  return (
    typeof entity.type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float, HDF5TypeClass.String].includes(
      entity.type.class
    )
  );
}

export function hasNumericType<S extends HDF5Shape>(
  dataset: MyHDF5Dataset<S>
): dataset is MyHDF5Dataset<S, HDF5NumericType> {
  return (
    typeof dataset.type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float].includes(dataset.type.class)
  );
}

export function assertDataset(
  entity: MyHDF5Entity,
  message = 'Expected dataset'
): asserts entity is MyHDF5Dataset {
  if (!isDataset(entity)) {
    throw new Error(message);
  }
}

export function assertGroup(
  entity: MyHDF5Entity,
  message = 'Expected group'
): asserts entity is MyHDF5Group {
  if (!isGroup(entity)) {
    throw new Error(message);
  }
}

export function assertNumericType<S extends HDF5Shape>(
  dataset: MyHDF5Dataset<S>
): asserts dataset is MyHDF5Dataset<S, HDF5NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertSimpleShape<T extends HDF5Type>(
  dataset: MyHDF5Dataset<HDF5Shape, T>
): asserts dataset is MyHDF5Dataset<HDF5SimpleShape, T> {
  if (!hasSimpleShape(dataset)) {
    throw new Error('Expected dataset to have simple shape');
  }

  if (dataset.shape.dims.length === 0) {
    throw new Error('Expected dataset with simple shape to have dimensions');
  }
}
