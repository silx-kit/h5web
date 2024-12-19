import { type Data, type NdArray, type TypedArray } from 'ndarray';

import {
  type ArrayShape,
  type BooleanType,
  type ComplexArray,
  type ComplexType,
  type CompoundType,
  type Dataset,
  type Datatype,
  type DType,
  DTypeClass,
  type Entity,
  EntityKind,
  type EnumType,
  type Group,
  type GroupWithChildren,
  type H5WebComplex,
  type NumericLikeType,
  type NumericType,
  type Primitive,
  type PrintableType,
  type ScalarShape,
  type Shape,
  type StringType,
  type Value,
} from './hdf5-models';
import {
  type AnyNumArray,
  type AxisScaleType,
  type ColorScaleType,
  type NumArray,
} from './vis-models';
import { AXIS_SCALE_TYPES, COLOR_SCALE_TYPES, getValues } from './vis-utils';

const PRINTABLE_DTYPES = new Set([
  DTypeClass.Unsigned,
  DTypeClass.Integer,
  DTypeClass.Float,
  DTypeClass.String,
  DTypeClass.Bool,
  DTypeClass.Enum,
  DTypeClass.Complex,
]);

export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/');
}

export function assertAbsolutePath(path: string): void {
  if (!isAbsolutePath(path)) {
    throw new Error("Expected path to start with '/'");
  }
}

export function isDefined<T>(val: T): val is T extends undefined ? never : T {
  return val !== undefined;
}

export function isNonNull<T>(val: T): val is T extends null ? never : T {
  return val !== null;
}

export function assertDefined<T>(
  val: T,
  message = 'Expected some value',
): asserts val is T extends undefined ? never : T {
  if (!isDefined(val)) {
    throw new TypeError(message);
  }
}

export function assertNonNull<T>(
  val: T,
  message = 'Expected value to not be null',
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

function assertNumOrBool(val: unknown): asserts val is number | boolean {
  if (typeof val !== 'number' && typeof val !== 'boolean') {
    throw new TypeError('Expected boolean or number');
  }
}

export function assertStr(
  val: unknown,
  message = 'Expected string',
): asserts val is string {
  if (typeof val !== 'string') {
    throw new TypeError(message);
  }
}

export function assertEnvVar(
  val: unknown,
  name: string,
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

export function assertArray(val: unknown): asserts val is unknown[] {
  if (!Array.isArray(val)) {
    throw new TypeError('Expected array');
  }
}

export function isTypedArray(val: unknown): val is TypedArray {
  return (
    val instanceof Int8Array ||
    val instanceof Int16Array ||
    val instanceof Int32Array ||
    val instanceof Uint8Array ||
    val instanceof Uint8ClampedArray ||
    val instanceof Uint16Array ||
    val instanceof Uint32Array ||
    val instanceof Float32Array ||
    val instanceof Float64Array
  );
}

export function assertArrayOrTypedArray(
  val: unknown,
): asserts val is unknown[] | TypedArray {
  if (!Array.isArray(val) && !isTypedArray(val)) {
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
  group: Group,
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
  message = 'Expected dataset',
): asserts entity is Dataset {
  if (!isDataset(entity)) {
    throw new Error(message);
  }
}

export function isDatatype(entity: Entity): entity is Datatype {
  return entity.kind === EntityKind.Datatype;
}

export function isH5WebComplex(
  complex: H5WebComplex | ComplexArray,
): complex is H5WebComplex {
  return typeof complex[0] === 'number';
}

export function isScalarShape(shape: Shape): shape is ScalarShape {
  return isNonNull(shape) && shape.length === 0;
}

export function hasScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): dataset is Dataset<ScalarShape, T> {
  return isScalarShape(dataset.shape);
}

export function assertScalarShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): asserts dataset is Dataset<ScalarShape, T> {
  if (!hasScalarShape(dataset)) {
    throw new Error('Expected dataset to have scalar shape');
  }
}

export function hasArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): dataset is Dataset<ArrayShape, T> {
  return isNonNull(dataset.shape) && dataset.shape.length > 0;
}

export function assertArrayShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): asserts dataset is Dataset<ArrayShape, T> {
  if (!hasArrayShape(dataset)) {
    throw new Error('Expected dataset to have array shape');
  }
}

export function hasNonNullShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): dataset is Dataset<ScalarShape | ArrayShape, T> {
  return isNonNull(dataset.shape);
}

export function assertNonNullShape<T extends DType>(
  dataset: Dataset<Shape, T>,
): asserts dataset is Dataset<ScalarShape | ArrayShape, T> {
  if (!hasNonNullShape(dataset)) {
    throw new Error('Expected dataset to have non-null shape');
  }
}

export function hasMinDims(dataset: Dataset<ArrayShape>, min: number): boolean {
  return dataset.shape.length >= min;
}

export function assertMinDims(dataset: Dataset<ArrayShape>, min: number): void {
  if (!hasMinDims(dataset, min)) {
    throw new Error(`Expected dataset with at least ${min} dimensions`);
  }
}

export function hasNumDims(dataset: Dataset<ArrayShape>, num: number): boolean {
  return dataset.shape.length === num;
}

export function assertNumDims(dataset: Dataset<ArrayShape>, num: number): void {
  if (!hasNumDims(dataset, num)) {
    throw new Error(`Expected dataset with ${num} dimensions`);
  }
}

export function isBoolType(type: DType): type is BooleanType {
  return type.class === DTypeClass.Bool;
}

export function hasBoolType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, BooleanType> {
  return isBoolType(dataset.type);
}

export function isEnumType(type: DType): type is EnumType {
  return type.class === DTypeClass.Enum;
}

export function hasEnumType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, EnumType> {
  return isEnumType(dataset.type);
}

function hasStringType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, StringType> {
  return dataset.type.class === DTypeClass.String;
}

export function assertStringType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, StringType> {
  if (!hasStringType(dataset)) {
    throw new Error('Expected dataset to have string type');
  }
}

export function isNumericType(type: DType): type is NumericType {
  return [DTypeClass.Integer, DTypeClass.Unsigned, DTypeClass.Float].includes(
    type.class,
  );
}

export function hasNumericType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, NumericType> {
  return isNumericType(dataset.type);
}

export function assertNumericType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, NumericType> {
  if (!hasNumericType(dataset)) {
    throw new Error('Expected dataset to have numeric type');
  }
}

export function hasNumericLikeType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, NumericLikeType> {
  const { type } = dataset;
  return isNumericType(type) || isBoolType(type) || isEnumType(type);
}

export function assertNumericLikeType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, NumericLikeType> {
  if (!hasNumericLikeType(dataset)) {
    throw new Error('Expected dataset to have numeric, boolean or enum type');
  }
}

export function isStringType(type: DType): type is StringType {
  return type.class === DTypeClass.String;
}

export function isComplexType(type: DType): type is ComplexType {
  return type.class === DTypeClass.Complex;
}

export function hasComplexType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, ComplexType> {
  return isComplexType(dataset.type);
}

export function assertComplexType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, ComplexType> {
  if (!hasComplexType(dataset)) {
    throw new Error('Expected dataset to have complex type');
  }
}

export function assertNumericLikeOrComplexType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, NumericLikeType | ComplexType> {
  if (!hasNumericLikeType(dataset) && !hasComplexType(dataset)) {
    throw new Error(
      'Expected dataset to have numeric, boolean, enum or complex type',
    );
  }
}

export function hasPrintableType<S extends Shape>(
  entity: Dataset<S>,
): entity is Dataset<S, PrintableType> {
  return PRINTABLE_DTYPES.has(entity.type.class);
}

export function assertPrintableType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, PrintableType> {
  if (
    !hasStringType(dataset) &&
    !hasNumericType(dataset) &&
    !hasBoolType(dataset) &&
    !hasEnumType(dataset) &&
    !hasComplexType(dataset)
  ) {
    throw new Error('Expected dataset to have displayable type');
  }
}

export function isCompoundType(type: DType): type is CompoundType {
  return type.class === DTypeClass.Compound;
}

export function hasCompoundType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, CompoundType> {
  return isCompoundType(dataset.type);
}

export function assertCompoundType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, CompoundType> {
  if (!hasCompoundType(dataset)) {
    throw new Error('Expected dataset to have compound type');
  }
}

export function hasPrintableCompoundType<S extends Shape>(
  dataset: Dataset<S, CompoundType>,
): dataset is Dataset<S, CompoundType<PrintableType>> {
  const { fields } = dataset.type;
  return Object.values(fields).every((f) => PRINTABLE_DTYPES.has(f.class));
}

export function assertPrintableCompoundType<S extends Shape>(
  dataset: Dataset<S, CompoundType>,
): asserts dataset is Dataset<S, CompoundType<PrintableType>> {
  if (!hasPrintableCompoundType(dataset)) {
    throw new Error('Expected compound dataset to have printable types');
  }
}

export function isComplexValue(
  type: DType,
  value: unknown,
): value is H5WebComplex | ComplexArray {
  return type.class === DTypeClass.Complex;
}

function assertPrimitiveValue(
  type: DType,
  value: unknown,
): asserts value is Primitive<DType> {
  if (isNumericType(type)) {
    assertNum(value);
  } else if (isStringType(type)) {
    assertStr(value);
  } else if (isBoolType(type)) {
    assertNumOrBool(value);
  } else if (isComplexType(type)) {
    assertComplex(value);
  } else if (isCompoundType(type)) {
    assertArray(value);
    Object.values(type.fields).forEach((fieldType, index) => {
      assertPrimitiveValue(fieldType, value[index]);
    });
  }
}

export function assertDatasetValue<D extends Dataset<ScalarShape | ArrayShape>>(
  value: unknown,
  dataset: D,
): asserts value is Value<D> {
  const { type } = dataset;

  if (hasScalarShape(dataset)) {
    assertPrimitiveValue(type, value);
  } else {
    assertArrayOrTypedArray(value);

    if (value.length > 0) {
      assertPrimitiveValue(type, value[0]);
    }
  }
}

export function assertLength(
  arr: AnyNumArray | undefined,
  dataLength: number,
  arrName: string,
): void {
  if (!arr) {
    return;
  }

  const { length: arrLength } = getValues(arr);
  if (arrLength !== dataLength) {
    throw new Error(
      `Expected ${arrName} array to have length ${dataLength} instead of ${arrLength}`,
    );
  }
}

export function isAxisScaleType(val: unknown): val is AxisScaleType {
  return (
    typeof val === 'string' && (AXIS_SCALE_TYPES as string[]).includes(val)
  );
}

export function isColorScaleType(val: unknown): val is ColorScaleType {
  return (
    typeof val === 'string' && (COLOR_SCALE_TYPES as string[]).includes(val)
  );
}

export function isNdArray<T extends Data>(
  arr: NdArray<T> | T,
): arr is NdArray<T> {
  return 'data' in arr;
}

export function isTypedNdArray<T extends NumArray>(
  ndArr: NdArray<T>,
): ndArr is NdArray<Exclude<T, number[]>> {
  return ndArr.dtype !== 'array';
}
