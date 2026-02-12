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
  type DTypeClassMap,
  type Entity,
  EntityKind,
  type EnumType,
  type FloatType,
  type Group,
  type GroupWithChildren,
  type H5WebComplex,
  type HasShape,
  type HasType,
  type IntegerType,
  type NumericLikeType,
  type NumericType,
  type PrintableType,
  type ScalarShape,
  type ScalarValue,
  type Shape,
  ShapeClass,
  type ShapeClassMap,
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

export function assertNum(
  val: unknown,
  message = 'Expected number',
): asserts val is number {
  if (typeof val !== 'number') {
    throw new TypeError(message);
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

export function isComplex(val: unknown): val is H5WebComplex {
  return (
    Array.isArray(val) &&
    val.length === 2 &&
    typeof val[0] === 'number' &&
    typeof val[1] === 'number'
  );
}

export function assertComplex(
  val: unknown,
  message = 'Expected complex',
): asserts val is H5WebComplex {
  if (
    !Array.isArray(val) ||
    val.length !== 2 ||
    typeof val[0] !== 'number' ||
    typeof val[1] !== 'number'
  ) {
    throw new TypeError(message);
  }
}

export function assertArray(
  val: unknown,
  message = 'Expected array',
): asserts val is unknown[] {
  if (!Array.isArray(val)) {
    throw new TypeError(message);
  }
}

export function isNonEmptyArray<T>(val: T[]): val is [T, ...T[]] {
  return val.length > 0;
}

export function assertNonEmptyArray<T>(
  val: T[],
  message = 'Expected non-empty array',
): asserts val is [T, ...T[]] {
  if (!isNonEmptyArray(val)) {
    throw new TypeError(message);
  }
}

export function isComplexArray(val: unknown): val is H5WebComplex[] {
  return Array.isArray(val) && isComplex(val[0]);
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

export function assertTypedArray(
  val: unknown,
  message = 'Expected typed array',
): asserts val is TypedArray {
  if (!isTypedArray(val)) {
    throw new TypeError(message);
  }
}

export function assertBigIntTypedArray(
  val: unknown,
  message = 'Expected bigint typed array',
): asserts val is BigIntTypedArray {
  if (!isBigIntTypedArray(val)) {
    throw new TypeError(message);
  }
}

export function assertArrayOrTypedArray(
  val: unknown,
  message = 'Expected array or typed array',
): asserts val is unknown[] | TypedArray {
  if (!Array.isArray(val) && !isTypedArray(val)) {
    throw new TypeError(message);
  }
}

export function assertAnyTypedArray(
  val: unknown,
  message = 'Expected typed array or bigint typed array',
): asserts val is TypedArray | BigIntTypedArray {
  if (!isTypedArray(val) && !isBigIntTypedArray(val)) {
    throw new TypeError(message);
  }
}

export function assertArrayOrAnyTypedArray(
  val: unknown,
  message = 'Expected array, typed array or bigint typed array',
): asserts val is unknown[] | TypedArray | BigIntTypedArray {
  if (!Array.isArray(val) && !isTypedArray(val) && !isBigIntTypedArray(val)) {
    throw new TypeError(message);
  }
}

export function isGroup(entity: Entity): entity is Group {
  return entity.kind === EntityKind.Group;
}

export function assertGroup(
  entity: Entity,
  message = 'Expected group',
): asserts entity is Group {
  if (!isGroup(entity)) {
    throw new Error(message);
  }
}

export function hasChildren(group: Group): group is GroupWithChildren {
  return 'children' in group;
}

export function assertGroupWithChildren(
  group: Group,
  message = 'Expected group with children',
): asserts group is GroupWithChildren {
  if (!hasChildren(group)) {
    throw new Error(message);
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

export function assertDatatype(
  entity: Entity,
  message = 'Expected datatype',
): asserts entity is Datatype {
  if (!isDatatype(entity)) {
    throw new Error(message);
  }
}

export function isH5WebComplex(
  complex: H5WebComplex | ComplexArray,
): complex is H5WebComplex {
  return typeof complex[0] === 'number';
}

export function isShape<C extends ShapeClass>(
  shape: Shape,
  shapeClass: C,
): shape is ShapeClassMap[C] {
  return shape.class === shapeClass;
}

export function hasShape<O extends HasShape, C extends ShapeClass>(
  obj: O,
  shapeClass: C,
): obj is O & HasShape<ShapeClassMap[C]> {
  return obj.shape.class === shapeClass;
}

export function assertShape<O extends HasShape, C extends ShapeClass>(
  obj: O,
  shapeClass: C,
  message = `Expected ${shapeClass.toLowerCase()} shape`,
): asserts obj is O & ShapeClassMap[C] {
  if (obj.shape.class !== shapeClass) {
    throw new TypeError(message);
  }
}

export function isScalarShape(shape: Shape): shape is ScalarShape {
  return shape.class === ShapeClass.Scalar;
}

export function hasScalarShape<O extends HasShape>(
  obj: O,
): obj is O & HasShape<ScalarShape> {
  return isScalarShape(obj.shape);
}

export function assertScalarShape<O extends HasShape>(
  obj: O,
  message = 'Expected scalar shape',
): asserts obj is O & HasShape<ScalarShape> {
  if (!hasScalarShape(obj)) {
    throw new Error(message);
  }
}

export function isArrayShape(shape: Shape): shape is ArrayShape {
  return shape.class === ShapeClass.Array;
}

export function hasArrayShape<O extends HasShape>(
  obj: O,
): obj is O & HasShape<ArrayShape> {
  return isArrayShape(obj.shape);
}

export function assertArrayShape<O extends HasShape>(
  obj: O,
  message = 'Expected array shape',
): asserts obj is O & HasShape<ArrayShape> {
  if (!hasArrayShape(obj)) {
    throw new Error(message);
  }
}

export function isNonNullShape(
  shape: Shape,
): shape is ScalarShape | ArrayShape {
  return shape.class !== ShapeClass.Null;
}

export function hasNonNullShape<O extends HasShape>(
  obj: O,
): obj is O & HasShape<ScalarShape | ArrayShape> {
  return isNonNullShape(obj.shape);
}

export function assertNonNullShape<O extends HasShape>(
  obj: O,
  message = 'Expected non-null shape',
): asserts obj is O & HasShape<ScalarShape | ArrayShape> {
  if (!hasNonNullShape(obj)) {
    throw new Error(message);
  }
}

export function hasMinDims(obj: HasShape<ArrayShape>, min: number): boolean {
  return obj.shape.dims.length >= min;
}

export function assertMinDims(
  obj: HasShape<ArrayShape>,
  min: number,
  message = `Expected dataset with at least ${min} dimensions`,
): void {
  if (!hasMinDims(obj, min)) {
    throw new Error(message);
  }
}

export function hasNumDims(obj: HasShape<ArrayShape>, num: number): boolean {
  return obj.shape.dims.length === num;
}

export function assertNumDims(
  obj: HasShape<ArrayShape>,
  num: number,
  message = `Expected ${num} dimensions`,
): void {
  if (!hasNumDims(obj, num)) {
    throw new Error(message);
  }
}

export function isType<C extends DTypeClass>(
  type: DType,
  dtypeClass: C,
): type is DTypeClassMap[C] {
  return type.class === dtypeClass;
}

export function hasType<O extends HasType, C extends DTypeClass>(
  obj: O,
  dtypeClass: C,
): obj is O & HasType<DTypeClassMap[C]> {
  return obj.type.class === dtypeClass;
}

export function assertType<O extends HasType, C extends DTypeClass>(
  obj: O,
  dtypeClass: C,
  message = `Expected ${dtypeClass.toLowerCase()} type`,
): asserts obj is O & DTypeClassMap[C] {
  if (obj.type.class !== dtypeClass) {
    throw new TypeError(message);
  }
}

export function isStringType(type: DType): type is StringType {
  return type.class === DTypeClass.String;
}

export function hasStringType<O extends HasType>(
  obj: O,
): obj is O & HasType<StringType> {
  return isStringType(obj.type);
}

export function assertStringType<O extends HasType>(
  obj: O,
  message = 'Expected string type',
): asserts obj is O & HasType<StringType> {
  if (!hasStringType(obj)) {
    throw new Error(message);
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

export function hasIntegerType<O extends HasType>(
  obj: O,
): obj is O & HasType<IntegerType> {
  return isIntegerType(obj.type);
}

export function hasFloatType<O extends HasType>(
  obj: O,
): obj is O & HasType<FloatType> {
  return isFloatType(obj.type);
}

export function hasNumericType<O extends HasType>(
  obj: O,
): obj is O & HasType<NumericType> {
  return isNumericType(obj.type);
}

export function assertIntegerType<O extends HasType>(
  obj: O,
  message = 'Expected integer type',
): asserts obj is O & HasType<IntegerType> {
  if (!hasIntegerType(obj)) {
    throw new Error(message);
  }
}

export function assertFloatType<O extends HasType>(
  obj: O,
  message = 'Expected float type',
): asserts obj is O & HasType<FloatType> {
  if (!hasFloatType(obj)) {
    throw new Error(message);
  }
}

export function assertNumericType<O extends HasType>(
  obj: O,
  message = 'Expected numeric type',
): asserts obj is O & HasType<NumericType> {
  if (!hasNumericType(obj)) {
    throw new Error(message);
  }
}

export function isBoolType(type: DType): type is BooleanType {
  return type.class === DTypeClass.Bool;
}

export function isEnumType(type: DType): type is EnumType {
  return type.class === DTypeClass.Enum;
}

export function isNumericLikeType(type: DType): type is NumericLikeType {
  return isNumericType(type) || isBoolType(type) || isEnumType(type);
}

export function hasBoolType<O extends HasType>(
  obj: O,
): obj is O & HasType<BooleanType> {
  return isBoolType(obj.type);
}

export function hasEnumType<O extends HasType>(
  obj: O,
): obj is O & HasType<EnumType> {
  return isEnumType(obj.type);
}

export function hasNumericLikeType<O extends HasType>(
  obj: O,
): obj is O & HasType<NumericLikeType> {
  return isNumericLikeType(obj.type);
}

export function assertBoolType<O extends HasType>(
  obj: O,
  message = 'Expected boolean type',
): asserts obj is O & HasType<BooleanType> {
  if (!hasBoolType(obj)) {
    throw new Error(message);
  }
}

export function assertEnumType<O extends HasType>(
  obj: O,
  message = 'Expected enum type',
): asserts obj is O & HasType<EnumType> {
  if (!hasEnumType(obj)) {
    throw new Error(message);
  }
}

export function assertNumericLikeType<O extends HasType>(
  obj: O,
  message = 'Expected numeric, boolean or enum type',
): asserts obj is O & HasType<NumericLikeType> {
  if (!hasNumericLikeType(obj)) {
    throw new Error(message);
  }
}

export function isComplexType(type: DType): type is ComplexType {
  return type.class === DTypeClass.Complex;
}

export function hasComplexType<O extends HasType>(
  obj: O,
): obj is O & HasType<ComplexType> {
  return isComplexType(obj.type);
}

export function assertComplexType<O extends HasType>(
  obj: O,
  message = 'Expected complex type',
): asserts obj is O & HasType<ComplexType> {
  if (!hasComplexType(obj)) {
    throw new Error(message);
  }
}

export function assertNumericLikeOrComplexType<O extends HasType>(
  obj: O,
  message = 'Expected numeric, boolean, enum or complex type',
): asserts obj is O & HasType<NumericLikeType | ComplexType> {
  if (!hasNumericLikeType(obj) && !hasComplexType(obj)) {
    throw new Error(message);
  }
}

export function isPrintableType(type: DType): type is PrintableType {
  return isStringType(type) || isNumericLikeType(type) || isComplexType(type);
}

export function hasPrintableType<O extends HasType>(
  obj: O,
): obj is O & HasType<PrintableType> {
  return isPrintableType(obj.type);
}

export function assertPrintableType<O extends HasType>(
  obj: O,
  message = 'Expected printable type',
): asserts obj is O & HasType<PrintableType> {
  if (!hasPrintableType(obj)) {
    throw new Error(message);
  }
}

export function isCompoundType(type: DType): type is CompoundType {
  return type.class === DTypeClass.Compound;
}

export function hasCompoundType<O extends HasType>(
  obj: O,
): obj is O & HasType<CompoundType> {
  return isCompoundType(obj.type);
}

export function assertCompoundType<O extends HasType>(
  obj: O,
  message = 'Expected compound type',
): asserts obj is O & HasType<CompoundType> {
  if (!hasCompoundType(obj)) {
    throw new Error(message);
  }
}

export function hasPrintableCompoundType<O extends HasType<CompoundType>>(
  obj: O,
): obj is O & HasType<CompoundType<PrintableType>> {
  const { fields } = obj.type;
  return Object.values(fields).every(isPrintableType);
}

export function assertPrintableCompoundType<O extends HasType<CompoundType>>(
  obj: O,
  message = 'Expected printable compound type',
): asserts obj is O & HasType<CompoundType<PrintableType>> {
  if (!hasPrintableCompoundType(obj)) {
    throw new Error(message);
  }
}

export function isComplexValue(
  type: DType,
  value: unknown,
): value is H5WebComplex | ComplexArray {
  return type.class === DTypeClass.Complex;
}

export function assertScalarValue<T extends DType>(
  value: unknown,
  type: T,
): asserts value is ScalarValue<T> {
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

export function assertValue<
  O extends HasShape<ArrayShape | ScalarShape> & HasType,
>(value: unknown, obj: O): asserts value is Value<O> {
  const { type } = obj;

  if (hasScalarShape(obj)) {
    assertScalarValue(value, type);
  } else {
    assertArrayOrAnyTypedArray(value);

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
