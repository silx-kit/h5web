import { isNumericType } from './guards';
import type {
  ArrayType,
  BitfieldType,
  BooleanType,
  CharSet,
  ChildEntity,
  ComplexType,
  CompoundType,
  DType,
  EnumType,
  GroupWithChildren,
  H5WebComplex,
  NumericType,
  OpaqueType,
  PrintableType,
  ReferenceType,
  StringType,
  TimeType,
  UnknownType,
} from './hdf5-models';
import { DTypeClass, Endianness, H5TCharSet, H5TOrder } from './hdf5-models';

export function getChildEntity(
  group: GroupWithChildren,
  entityName: string,
): ChildEntity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function buildEntityPath(
  parentPath: string,
  entityNameOrRelativePath: string,
): string {
  const prefix = parentPath === '/' ? '' : parentPath;
  return `${prefix}/${entityNameOrRelativePath}`;
}

/* ----------------- */
/* ----- TYPES ----- */

export function intType(size = 32, endianness = Endianness.LE): NumericType {
  return { class: DTypeClass.Integer, endianness, size };
}

export function uintType(size = 32, endianness = Endianness.LE): NumericType {
  return { class: DTypeClass.Unsigned, endianness, size };
}

export function intOrUintType(
  isSigned: boolean,
  size = 32,
  endianness = Endianness.LE,
) {
  const func = isSigned ? intType : uintType;
  return func(size, endianness);
}

export function floatType(size = 32, endianness = Endianness.LE): NumericType {
  return { class: DTypeClass.Float, endianness, size };
}

export function strType(
  charSet: CharSet = 'ASCII',
  length?: number,
): StringType {
  return {
    class: DTypeClass.String,
    charSet,
    ...(length !== undefined && { length }),
  };
}

export function boolType(): BooleanType {
  return { class: DTypeClass.Bool };
}

export function cplxType(
  realType: NumericType,
  imagType = realType,
): ComplexType {
  return { class: DTypeClass.Complex, realType, imagType };
}

export function compoundType<F extends Record<string, DType>>(
  fields: F,
): CompoundType<F> {
  return { class: DTypeClass.Compound, fields };
}

export const printableCompoundType = compoundType<
  Record<string, PrintableType>
>;

export function compoundOrCplxType<F extends Record<string, DType>>(
  fields: F,
): CompoundType<F> | ComplexType {
  const { r, i } = fields;
  if (r && isNumericType(r) && i && isNumericType(i)) {
    return cplxType(r, i);
  }

  return compoundType(fields);
}

export function arrayType<T extends DType>(
  baseType: T,
  dims?: number[],
): ArrayType<T> {
  return {
    class: dims ? DTypeClass.Array : DTypeClass.VLen,
    base: baseType,
    ...(dims && { dims }),
  };
}

export function enumType(
  baseType: NumericType,
  mapping: Record<string, number>,
): EnumType {
  return { class: DTypeClass.Enum, base: baseType, mapping };
}

export function isBoolEnumType(type: EnumType): boolean {
  const { mapping } = type;
  return (
    Object.keys(mapping).length === 2 &&
    mapping.FALSE === 0 &&
    mapping.TRUE === 1
  );
}

export function enumOrBoolType(
  baseType: NumericType,
  mapping: Record<string, number>,
): EnumType | BooleanType {
  if (mapping.FALSE === 0 && mapping.TRUE === 1) {
    return boolType();
  }

  return enumType(baseType, mapping);
}

export function timeType(): TimeType {
  return { class: DTypeClass.Time };
}

export function bitfieldType(endianness = Endianness.LE): BitfieldType {
  return { class: DTypeClass.Bitfield, endianness };
}

export function opaqueType(tag = ''): OpaqueType {
  return { class: DTypeClass.Opaque, tag };
}

export function referenceType(): ReferenceType {
  return { class: DTypeClass.Reference };
}

export function unknownType(): UnknownType {
  return { class: DTypeClass.Unknown };
}

/* ------------------ */
/* ----- VALUES ----- */

export function cplx(real: number, imag: number): H5WebComplex {
  return [real, imag];
}

/* ------------------------- */
/* --- HDF5 ENUM HELPERS --- */

export function toEndianness(h5tOrder: number): Endianness {
  return h5tOrder === H5TOrder.BE ? Endianness.BE : Endianness.LE;
}

export function toCharSet(h5tCharSet: number): CharSet {
  return h5tCharSet === H5TCharSet.ASCII ? 'ASCII' : 'UTF-8';
}
