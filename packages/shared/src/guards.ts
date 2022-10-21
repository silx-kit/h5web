import { isTypedArray as isTypedArrayLodash } from 'lodash';
import type { Data, NdArray, TypedArray } from 'ndarray';
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
  Primitive,
  Value,
  CompoundType,
  PrintableCompoundType,
} from './models-hdf5';
import type { AnyNumArray, NumArray } from './models-vis';
import { ScaleType } from './models-vis';
import { getValues } from './utils';

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

export function isNonNull<T>(val: T): val is T extends null ? never : T {
  return val !== null;
}

export function assertDefined<T>(
  val: T,
  message = 'Expected some value'
): asserts val is T extends undefined ? never : T {
  if (!isDefined(val)) {
    throw new TypeError(message);
  }
}

export function assertNonNull<T>(
  val: T,
  message = 'Expected value to not be null'
): asserts val is T extends null ? never : T {
  if (!isNonNull(val)) {
    throw new TypeError(message);
  }
}

function assertNum(val: unknown): asserts val is number {
  if (typeof val !== 'number') {
    throw new TypeError('Expected number');
  }
}

function assertBool(val: unknown): asserts val is boolean {
  if (typeof val !== 'boolean') {
    throw new TypeError('Expected boolean');
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

export function assertEnvVar(
  val: unknown,
  name: string
): asserts val is string {
  assertStr(val, `Expected environment variable ${name} to be defined`);
  if (val === '') {
    throw new Error(`Expected environment variable ${name} to not be empty`);
  }
}

function assertComplex(val: unknown): asserts val is H5WebComplex {
  if (
    !Array.isArray(val) ||
    val.length !== 2 ||
    typeof val[0] !== 'number' ||
    typeof val[1] !== 'number'
  ) {
    throw new TypeError('Expected complex');
  }
}

export function assertArray<T>(val: unknown): asserts val is T[] {
  if (!Array.isArray(val)) {
    throw new TypeError('Expected array');
  }
}

export function assertArrayOrTypedArray<T>(
  val: unknown
): asserts val is T[] | TypedArray {
  if (!Array.isArray(val) && !isTypedArrayLodash(val)) {
    throw new TypeError('Expected array or typed array');
  }
}

export function isGroup(entity: Entity): entity is Group {
  return entity.kind === EntityKind.Group;
}

export function assertGroup(entity: Entity): asserts entity is Group {
  if (!isGroup(entity)) {
    throw new Error('Expected group');
  }
}

export function hasChildren(group: Group): group is GroupWithChildren {
  return 'children' in group;
}

export function assertGroupWithChildren(
  group: Group
): asserts group is GroupWithChildren {
  if (!hasChildren(group)) {
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
  return isNonNull(shape) && shape.length === 0;
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
  return isNonNull(dataset.shape) && dataset.shape.length > 0;
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
  return isNonNull(dataset.shape);
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

export function hasBoolType<S extends Shape>(
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

export function isStringType(type: DType): type is StringType {
  return type.class === DTypeClass.String;
}

export function isComplexType(type: DType): type is ComplexType {
  return type.class === DTypeClass.Complex;
}

export function hasComplexType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, ComplexType> {
  return isComplexType(dataset.type);
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

export function hasCompoundType<S extends Shape>(
  dataset: Dataset<S>
): dataset is Dataset<S, CompoundType> {
  return dataset.type.class === DTypeClass.Compound;
}

export function assertCompoundType<S extends Shape>(
  dataset: Dataset<S>
): asserts dataset is Dataset<S, CompoundType> {
  if (!hasCompoundType(dataset)) {
    throw new Error('Expected dataset to have compound type');
  }
}

export function hasPrintableCompoundType<S extends Shape>(
  dataset: Dataset<S, CompoundType>
): dataset is Dataset<S, PrintableCompoundType> {
  const { fields } = dataset.type;
  return Object.values(fields).every((f) => PRINTABLE_DTYPES.has(f.class));
}

export function assertPrintableCompoundType<S extends Shape>(
  dataset: Dataset<S, CompoundType>
): asserts dataset is Dataset<S, PrintableCompoundType> {
  if (!hasPrintableCompoundType(dataset)) {
    throw new Error('Expected compound dataset to have printable types');
  }
}

export function isComplexValue(
  type: DType,
  value: unknown
): value is H5WebComplex | ComplexArray {
  return type.class === DTypeClass.Complex;
}

function assertPrimitiveValue<T extends DType, D extends Dataset<Shape, T>>(
  dataset: D,
  value: unknown
): asserts value is Primitive<T> {
  if (hasNumericType(dataset)) {
    assertNum(value);
  } else if (hasStringType(dataset)) {
    assertStr(value);
  } else if (hasBoolType(dataset)) {
    assertBool(value);
  } else if (hasComplexType(dataset)) {
    assertComplex(value);
  }
}

export function assertDatasetValue<D extends Dataset<ScalarShape | ArrayShape>>(
  value: unknown,
  dataset: D
): asserts value is Value<D> {
  if (hasArrayShape(dataset)) {
    assertArrayOrTypedArray(value);

    if (value.length > 0) {
      assertPrimitiveValue(dataset, value[0]);
    }
  } else {
    // Scalar shape
    assertPrimitiveValue(dataset, value);
  }
}

export function assertLength(
  arr: AnyNumArray | undefined,
  dataLength: number,
  arrName: string
) {
  if (!arr) {
    return;
  }

  const { length: arrLength } = getValues(arr);
  if (arrLength !== dataLength) {
    throw new Error(
      `Expected ${arrName} array to have length ${dataLength} instead of ${arrLength}`
    );
  }
}

export function isScaleType(val: unknown): val is ScaleType {
  return (
    typeof val === 'string' && Object.values<string>(ScaleType).includes(val)
  );
}

export function isNdArray<T extends Data>(
  arr: NdArray<T> | T
): arr is NdArray<T> {
  return 'data' in arr;
}

export function isTypedArray<T, U extends TypedArray>(arr: U | T[]): arr is U {
  return !Array.isArray(arr);
}

export function isTypedNdArray<T extends NumArray>(
  ndArr: NdArray<T>
): ndArr is NdArray<Exclude<T, number[]>> {
  return ndArr.dtype !== 'array';
}
