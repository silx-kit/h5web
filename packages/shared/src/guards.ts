import type { NdArray } from 'ndarray';
import type { ReactChild, ReactElement } from 'react';

import { EntityKind, DTypeClass } from './models-hdf5';
import type {
  Entity,
  Group,
  GroupWithChildren,
  Dataset,
  Datatype,
  Shape,
  ScalarShape,
  ArrayShape,
  DType,
  NumericType,
  H5WebComplex,
  ComplexArray,
  BooleanType,
  ComplexType,
  PrintableType,
  StringType,
} from './models-hdf5';
import { ScaleType } from './models-vis';
import { toArray } from './utils';

const PRINTABLE_DTYPES = new Set([
  DTypeClass.Unsigned,
  DTypeClass.Integer,
  DTypeClass.Float,
  DTypeClass.String,
  DTypeClass.Bool,
  DTypeClass.Complex,
]);

export function isAbsolutePath(path: string) {
  return path.startsWith('/');
}

export function assertAbsolutePath(path: string) {
  if (!isAbsolutePath(path)) {
    throw new Error("Expected path to start with '/'");
  }
}

export function isReactElement(child: ReactChild): child is ReactElement {
  return typeof child !== 'string' && typeof child !== 'number';
}

export function isDefined<T>(val: T): val is T extends undefined ? never : T {
  return val !== undefined;
}

export function assertDefined<T>(
  val: T,
  message = 'Expected some value'
): asserts val is T extends undefined ? never : T {
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

export function hasChildren(group: Group): group is GroupWithChildren {
  return 'children' in group;
}

export function assertGroupWithChildren(
  entity: Entity
): asserts entity is GroupWithChildren {
  if (!isGroup(entity) || !hasChildren(entity)) {
    throw new Error('Expected group with children');
  }
}

export function isDataset(entity: Entity): entity is Dataset {
  return entity.kind === EntityKind.Dataset;
}

export function assertDataset(
  entity: Entity,
  message = 'Expected dataset'
): asserts entity is Dataset {
  if (!isDataset(entity)) {
    throw new Error(message);
  }
}

export function isDatatype(entity: Entity): entity is Datatype {
  return entity.kind === EntityKind.Datatype;
}

export function isH5WebComplex(
  complex: H5WebComplex | ComplexArray
): complex is H5WebComplex {
  return typeof complex[0] === 'number';
}

export function isScalarShape(shape: Shape): shape is ScalarShape {
  return shape !== null && shape.length === 0;
}

export function hasScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ScalarShape, T> {
  return isScalarShape(dataset.shape);
}

export function assertScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ScalarShape, T> {
  if (!hasScalarShape(dataset)) {
    throw new Error('Expected dataset to have scalar shape');
  }
}

export function hasArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ArrayShape, T> {
  return dataset.shape !== null && dataset.shape.length > 0;
}

export function assertArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ArrayShape, T> {
  if (!hasArrayShape(dataset)) {
    throw new Error('Expected dataset to have array shape');
  }
}

export function hasNonNullShape<T extends DType>(
  dataset: Dataset<Shape, T>
): dataset is Dataset<ScalarShape | ArrayShape, T> {
  return dataset.shape !== null;
}

export function assertNonNullShape<T extends DType>(
  dataset: Dataset<Shape, T>
): asserts dataset is Dataset<ScalarShape | ArrayShape, T> {
  if (!hasNonNullShape(dataset)) {
    throw new Error('Expected dataset to have non-null shape');
  }
}

export function hasMinDims(dataset: Dataset<ArrayShape>, min: number): boolean {
  return dataset.shape.length >= min;
}

export function assertMinDims(dataset: Dataset<ArrayShape>, min: number) {
  if (!hasMinDims(dataset, min)) {
    throw new Error(`Expected dataset with at least ${min} dimensions`);
  }
}

export function hasNumDims(dataset: Dataset<ArrayShape>, num: number): boolean {
  return dataset.shape.length === num;
}

export function assertNumDims(dataset: Dataset<ArrayShape>, num: number) {
  if (!hasNumDims(dataset, num)) {
    throw new Error(`Expected dataset with ${num} dimensions`);
  }
}

function hasBoolType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, BooleanType> {
  return dataset.type.class === DTypeClass.Bool;
}

function hasStringType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, StringType> {
  return dataset.type.class === DTypeClass.String;
}

export function assertStringType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, StringType> {
  if (!hasStringType(dataset)) {
    throw new Error('Expected dataset to have string type');
  }
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

export function assertNumericType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function hasComplexType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, ComplexType> {
  return dataset.type.class === DTypeClass.Complex;
}

export function assertComplexType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, ComplexType> {
  if (!hasComplexType(dataset)) {
    throw new Error('Expected dataset to have complex type');
  }
}

export function assertNumericOrComplexType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, NumericType | ComplexType> {
  if (!hasNumericType(dataset) && !hasComplexType(dataset)) {
    throw new Error('Expected dataset to have numeric or complex type');
  }
}

export function hasPrintableType<S extends Shape>(
  entity: Dataset<S>
): entity is Dataset<S, PrintableType> {
  return PRINTABLE_DTYPES.has(entity.type.class);
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

export function isComplexValue(
  type: DType,
  value: unknown
): value is H5WebComplex | ComplexArray {
  return type.class === DTypeClass.Complex;
}

export function assertDataLength(
  arr: NdArray<AnyArray<number>> | number[] | undefined,
  dataArray: NdArray<AnyArray<number>> | number[],
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

export function isScaleType(val: unknown): val is ScaleType {
  return (
    typeof val === 'string' && Object.values<string>(ScaleType).includes(val)
  );
}
