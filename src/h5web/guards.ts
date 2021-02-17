import {
  Entity,
  EntityKind,
  Group,
  Datatype,
  Dataset,
  Link,
} from './providers/models';
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
  HDF5ScalarShape,
  HDF5NumericType,
  HDF5StringType,
  HDF5BooleanType,
} from './providers/hdf5-models';

export function isDefined<T>(val: T): val is NonNullable<T> {
  return val !== undefined;
}

export function assertDefined<T>(
  val: T,
  message = 'Expected some value'
): asserts val is NonNullable<T> {
  if (!isDefined(val)) {
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

export function assertOptionalStr(
  val: unknown
): asserts val is string | undefined {
  if (val !== undefined) {
    assertStr(val);
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

export function isGroup(entity: Entity): entity is Group {
  return entity.kind === EntityKind.Group;
}

export function isDataset(entity: Entity): entity is Dataset {
  return entity.kind === EntityKind.Dataset;
}

export function isDatatype(entity: Entity): entity is Datatype {
  return entity.kind === EntityKind.Datatype;
}

export function isLink(entity: Entity): entity is Link {
  return entity.kind === EntityKind.Link;
}

export function isHardLink(link: HDF5Link): link is HDF5HardLink {
  return link.class === HDF5LinkClass.Hard;
}

export function hasSimpleShape<T extends HDF5Type>(
  dataset: Dataset<HDF5Shape, T>
): dataset is Dataset<HDF5SimpleShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Simple;
}

export function hasScalarShape<T extends HDF5Type>(
  dataset: Dataset<HDF5Shape, T>
): dataset is Dataset<HDF5ScalarShape, T> {
  return dataset.shape.class === HDF5ShapeClass.Scalar;
}

export function hasBaseType<S extends HDF5Shape>(
  entity: Dataset<S>
): entity is Dataset<S, HDF5BaseType> {
  return (
    typeof entity.type !== 'string' &&
    [
      HDF5TypeClass.Integer,
      HDF5TypeClass.Float,
      HDF5TypeClass.String,
      HDF5TypeClass.Bool,
    ].includes(entity.type.class)
  );
}

export function hasBoolType<S extends HDF5Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5BooleanType> {
  return (
    typeof dataset.type !== 'string' &&
    dataset.type.class === HDF5TypeClass.Bool
  );
}

export function hasStringType<S extends HDF5Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5StringType> {
  return (
    typeof dataset.type !== 'string' &&
    dataset.type.class === HDF5TypeClass.String
  );
}

export function hasNumericType<S extends HDF5Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5NumericType> {
  return (
    typeof dataset.type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float].includes(dataset.type.class)
  );
}

export function hasMinDims(
  dataset: Dataset<HDF5SimpleShape>,
  min: number
): boolean {
  return dataset.shape.dims.length >= min;
}

export function isAbsolutePath(path: string) {
  return path.startsWith('/');
}

export function assertDataset(
  entity: Entity,
  message = 'Expected dataset'
): asserts entity is Dataset {
  if (!isDataset(entity)) {
    throw new Error(message);
  }
}

export function assertGroup(
  entity: Entity,
  message = 'Expected group'
): asserts entity is Group {
  if (!isGroup(entity)) {
    throw new Error(message);
  }
}

export function assertScalarShape<T extends HDF5Type>(
  dataset: Dataset<HDF5Shape, T>
): asserts dataset is Dataset<HDF5ScalarShape, T> {
  if (!hasScalarShape(dataset)) {
    throw new Error('Expected dataset to have scalar shape');
  }
}

export function assertSimpleShape<T extends HDF5Type>(
  dataset: Dataset<HDF5Shape, T>
): asserts dataset is Dataset<HDF5SimpleShape, T> {
  if (!hasSimpleShape(dataset)) {
    throw new Error('Expected dataset to have simple shape');
  }

  if (dataset.shape.dims.length === 0) {
    throw new Error('Expected dataset with simple shape to have dimensions');
  }
}

export function assertBaseType<S extends HDF5Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, HDF5BaseType> {
  if (
    !hasStringType(dataset) &&
    !hasNumericType(dataset) &&
    !hasBoolType(dataset)
  ) {
    throw new Error(
      'Expected dataset to have string or numeric or boolean type'
    );
  }
}

export function assertStringType<S extends HDF5Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, HDF5StringType> {
  if (!hasStringType(dataset)) {
    throw new Error('Expected dataset to have string type');
  }
}

export function assertNumericType<S extends HDF5Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, HDF5NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertMinDims(dataset: Dataset<HDF5SimpleShape>, min: number) {
  if (!hasMinDims(dataset, min)) {
    throw new Error(
      `Expected dataset with at least ${min} dimension${min > 1 ? 's' : ''}`
    );
  }
}

export function assertAbsolutePath(path: string) {
  if (!isAbsolutePath(path)) {
    throw new Error("Expected path to start with '/'");
  }
}
