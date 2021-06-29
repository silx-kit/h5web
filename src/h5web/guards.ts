import type { NdArray } from 'ndarray';
import {
  Entity,
  EntityKind,
  Group,
  Datatype,
  Dataset,
  Shape,
  ArrayShape,
  ScalarShape,
  DType,
  DTypeClass,
  NumericType,
  StringType,
  BooleanType,
  ComplexType,
  ComplexArray,
  H5WebComplex,
} from './providers/models';
import type { PrintableType } from './vis-packs/core/models';
import { toArray } from './vis-packs/core/utils';

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

export function assertArray<T>(val: unknown): asserts val is T[] {
  if (!Array.isArray(val)) {
    throw new TypeError('Expected array');
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

export function isScalarShape(shape: Shape): shape is ScalarShape {
  return shape !== null && shape.length === 0;
}

export function hasScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ScalarShape, T> {
  return isScalarShape(dataset.shape);
}

export function hasArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ArrayShape, T> {
  return dataset.shape !== null && dataset.shape.length > 0;
}

export function hasNonNullShape<T extends DType>(
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
    DTypeClass.Unsigned,
    DTypeClass.Integer,
    DTypeClass.Float,
    DTypeClass.String,
    DTypeClass.Bool,
    DTypeClass.Complex,
  ].includes(entity.type.class);
}

function hasBoolType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, BooleanType> {
  return dataset.type.class === DTypeClass.Bool;
}

export function hasComplexType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, ComplexType> {
  return dataset.type.class === DTypeClass.Complex;
}

function hasStringType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, StringType> {
  return dataset.type.class === DTypeClass.String;
}

export function isNumericType(type: DType): type is NumericType {
  return [DTypeClass.Integer, DTypeClass.Unsigned, DTypeClass.Float].includes(
    type.class
  );
}

export function hasNumericType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, NumericType> {
  return isNumericType(dataset.type);
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

export function assertScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ScalarShape, T> {
  if (!hasScalarShape(dataset)) {
    throw new Error('Expected dataset to have scalar shape');
  }
}

export function assertArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ArrayShape, T> {
  if (!hasArrayShape(dataset)) {
    throw new Error('Expected dataset to have array shape');
  }
}

export function assertNonNullShape<T extends DType>(
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

export function assertNumDims(
  dataset: Dataset<ArrayShape>,
  expectedNum: number
) {
  if (dataset.shape.length !== expectedNum) {
    throw new Error(`Expected dataset with ${expectedNum} dimensions`);
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
): asserts dataset is Dataset<S, StringType> {
  if (!hasStringType(dataset)) {
    throw new Error('Expected dataset to have string type');
  }
}

export function assertNumericType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function assertNumericOrComplexType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, NumericType | ComplexType> {
  if (!hasNumericType(dataset) && !hasComplexType(dataset)) {
    throw new Error('Expected dataset to have numeric or complex type');
  }
}

export function assertAbsolutePath(path: string) {
  if (!isAbsolutePath(path)) {
    throw new Error("Expected path to start with '/'");
  }
}

export function assertDataLength(
  arr: NdArray | number[] | undefined,
  dataArray: NdArray | number[],
  arrName: string
) {
  if (!arr) {
    return;
  }

  const { length: arrLength } = toArray(arr);
  const { length: dataLength } = toArray(dataArray);

  if (arrLength !== dataLength) {
    throw new Error(
      `Expected ${arrName} array (${arrLength}) to have same length as data array (${dataLength})`
    );
  }
}

export function isComplexValue(
  type: DType,
  value: unknown
): value is H5WebComplex | ComplexArray {
  return type.class === DTypeClass.Complex;
}

export function isH5WebComplex(
  complex: H5WebComplex | ComplexArray
): complex is H5WebComplex {
  return typeof complex[0] === 'number';
}

export function assertComplexType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, ComplexType> {
  if (!hasComplexType(dataset)) {
    throw new Error('Expected dataset to have complex type');
  }
}
