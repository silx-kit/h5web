import {
  Entity,
  EntityKind,
  Group,
  Datatype,
  Dataset,
  Link,
  Shape,
  ArrayShape,
  ScalarShape,
} from './providers/models';
import {
  HDF5HardLink,
  HDF5Link,
  HDF5LinkClass,
  HDF5Type,
  HDF5TypeClass,
  HDF5NumericType,
  HDF5StringType,
  HDF5BooleanType,
  HDF5ComplexType,
} from './providers/hdf5-models';
import type { PrintableType } from './vis-packs/core/models';

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

export function isScalarShape(shape: Shape): shape is ScalarShape {
  return shape !== null && shape.length === 0;
}

export function hasScalarShape<T extends HDF5Type>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ScalarShape, T> {
  return isScalarShape(dataset.shape);
}

export function hasArrayShape<T extends HDF5Type>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ArrayShape, T> {
  return dataset.shape !== null && dataset.shape.length > 0;
}

export function hasNonNullShape<T extends HDF5Type>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ScalarShape | ArrayShape, T> {
  return dataset.shape !== null;
}

export function hasMinDims(dataset: Dataset<ArrayShape>, min: number): boolean {
  return dataset.shape.length >= min;
}

export function hasPrintableType<S extends Shape>(
  entity: Dataset<S>
): entity is Dataset<S, PrintableType> {
  return [
    HDF5TypeClass.Integer,
    HDF5TypeClass.Float,
    HDF5TypeClass.String,
    HDF5TypeClass.Bool,
    HDF5TypeClass.Complex,
  ].includes(entity.type.class);
}

export function hasBoolType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5BooleanType> {
  return dataset.type.class === HDF5TypeClass.Bool;
}

export function hasComplexType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5ComplexType> {
  return dataset.type.class === HDF5TypeClass.Complex;
}

export function hasStringType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5StringType> {
  return dataset.type.class === HDF5TypeClass.String;
}

export function hasNumericType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, HDF5NumericType> {
  return [HDF5TypeClass.Integer, HDF5TypeClass.Float].includes(
    dataset.type.class
  );
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
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ScalarShape, T> {
  if (!hasScalarShape(dataset)) {
    throw new Error('Expected dataset to have scalar shape');
  }
}

export function assertArrayShape<T extends HDF5Type>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ArrayShape, T> {
  if (!hasArrayShape(dataset)) {
    throw new Error('Expected dataset to have array shape');
  }
}

export function assertNonNullShape<T extends HDF5Type>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ScalarShape | ArrayShape, T> {
  if (!hasNonNullShape(dataset)) {
    throw new Error('Expected dataset to have non-null shape');
  }
}

export function assertMinDims(dataset: Dataset<ArrayShape>, min: number) {
  if (!hasMinDims(dataset, min)) {
    throw new Error(`Expected dataset with at least ${min} dimensions`);
  }
}

export function assertPrintableType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, PrintableType> {
  if (
    !hasStringType(dataset) &&
    !hasNumericType(dataset) &&
    !hasBoolType(dataset) &&
    !hasComplexType(dataset)
  ) {
    throw new Error('Expected dataset to have displayable type');
  }
}

export function assertStringType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, HDF5StringType> {
  if (!hasStringType(dataset)) {
    throw new Error('Expected dataset to have string type');
  }
}

export function assertNumericType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, HDF5NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertAbsolutePath(path: string) {
  if (!isAbsolutePath(path)) {
    throw new Error("Expected path to start with '/'");
  }
}
