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
  type FloatType,
  type Group,
  type GroupWithChildren,
  type H5WebComplex,
  type IntegerType,
  type NumericLikeType,
  type NumericType,
  type PrintableType,
  type ScalarShape,
  type ScalarValue,
  type Shape,
  type StringType,
  type Value,
} from './hdf5-models';
import {
  type AnyNumArray,
  type AxisScaleType,
  type BigIntTypedArray,
  type ColorScaleType,
  type NumArray,
} from './vis-models';
import { AXIS_SCALE_TYPES, COLOR_SCALE_TYPES, getValues } from './vis-utils';

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

function assertNumOrBigInt(val: unknown): asserts val is number | bigint {
  if (typeof val !== 'number' && typeof val !== 'bigint') {
    throw new TypeError('Expected number or bigint');
  }
}

function assertNumOrBool(val: unknown): asserts val is number | boolean {
  if (typeof val !== 'number' && typeof val !== 'boolean') {
    throw new TypeError('Expected number or boolean');
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

export function isBigIntTypedArray(val: unknown): val is BigIntTypedArray {
  return val instanceof BigInt64Array || val instanceof BigUint64Array;
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

export function isIntegerType(type: DType): type is IntegerType {
  return type.class === DTypeClass.Integer;
}

export function isFloatType(type: DType): type is FloatType {
  return type.class === DTypeClass.Float;
}

export function isNumericType(type: DType): type is NumericType {
  return isIntegerType(type) || isFloatType(type);
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

export function isNumericLikeType(type: DType): type is NumericLikeType {
  return isNumericType(type) || isBoolType(type) || isEnumType(type);
}

export function hasNumericLikeType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, NumericLikeType> {
  return isNumericLikeType(dataset.type);
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

export function isPrintableType(type: DType): type is PrintableType {
  return isStringType(type) || isNumericLikeType(type) || isComplexType(type);
}

export function hasPrintableType<S extends Shape>(
  dataset: Dataset<S>,
): dataset is Dataset<S, PrintableType> {
  return isPrintableType(dataset.type);
}

export function assertPrintableType<S extends Shape>(
  dataset: Dataset<S>,
): asserts dataset is Dataset<S, PrintableType> {
  if (!hasPrintableType(dataset)) {
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
  return Object.values(fields).every(isPrintableType);
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

export function assertScalarValue(
  value: unknown,
  type: DType,
): asserts value is ScalarValue {
  if (isIntegerType(type) && type.size === 64) {
    assertNumOrBigInt(value);
  } else if (isNumericType(type)) {
    assertNum(value);
  } else if (isBoolType(type)) {
    assertNumOrBool(value);
  } else if (isEnumType(type)) {
    assertNum(value);
  } else if (isStringType(type)) {
    assertStr(value);
  } else if (isComplexType(type)) {
    assertComplex(value);
  } else if (isCompoundType(type)) {
    assertArray(value);
    Object.values(type.fields).forEach((fieldType, index) => {
      assertScalarValue(value[index], fieldType);
    });
  }
}

export function assertDatasetValue<D extends Dataset<ScalarShape | ArrayShape>>(
  value: unknown,
  dataset: D,
): asserts value is Value<D> {
  const { type } = dataset;

  if (hasScalarShape(dataset)) {
    assertScalarValue(value, type);
  } else {
    if (
      !Array.isArray(value) &&
      !isTypedArray(value) &&
      !isBigIntTypedArray(value)
    ) {
      throw new TypeError('Expected array or typed array');
    }

    if (value.length > 0) {
      assertScalarValue(value[0], type);
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
