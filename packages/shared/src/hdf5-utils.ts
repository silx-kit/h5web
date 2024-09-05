import { isNumericType } from './guards';
import {
  H5T_CSET,
  H5T_ORDER,
  H5T_STR,
  H5T_TO_CHAR_SET,
  H5T_TO_ENDIANNESS,
  H5T_TO_STR_PAD,
} from './h5t';
import type {
  ArrayType,
  BigIntegerType,
  BitfieldType,
  BooleanType,
  ChildEntity,
  ComplexType,
  CompoundType,
  DType,
  EnumType,
  FloatType,
  GroupWithChildren,
  H5WebComplex,
  IntegerType,
  NumericType,
  OpaqueType,
  PrintableType,
  ReferenceType,
  StringType,
  TimeType,
  UnknownType,
} from './hdf5-models';
import { DTypeClass } from './hdf5-models';

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

export function getNameFromPath(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

/* ----------------- */
/* ----- TYPES ----- */

export function intType(
  signed = true,
  size = 32,
  h5tOrder = H5T_ORDER.LE,
): IntegerType {
  return {
    class: DTypeClass.Integer,
    signed,
    size,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
  };
}

export function bigIntType(
  signed = true,
  h5tOrder = H5T_ORDER.LE,
): BigIntegerType {
  return {
    class: DTypeClass.BigInteger,
    signed,
    size: 64,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
  };
}

export function intOrBigIntType(
  signed = true,
  size = 32,
  h5tOrder = H5T_ORDER.LE,
): IntegerType | BigIntegerType {
  return size === 64
    ? bigIntType(signed, h5tOrder)
    : intType(signed, size, h5tOrder);
}

export function floatType(size = 32, h5tOrder = H5T_ORDER.LE): FloatType {
  return {
    class: DTypeClass.Float,
    size,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
  };
}

export function strType(
  h5tCharSet = H5T_CSET.ASCII,
  h5tStrPad = H5T_STR.NULLTERM,
  length?: number,
): StringType {
  return {
    class: DTypeClass.String,
    charSet: H5T_TO_CHAR_SET[h5tCharSet],
    strPad: H5T_TO_STR_PAD[h5tStrPad],
    ...(length !== undefined && { length }),
  };
}

export function boolType(): BooleanType {
  return { class: DTypeClass.Bool };
}

export function cplxType(
  realType: NumericType | BigIntegerType,
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
  baseType: NumericType | BigIntegerType,
  hdf5Mapping: Record<string, number>,
): EnumType {
  return {
    class: DTypeClass.Enum,
    base: baseType,
    // Swap mapping to optimise retrieval of enum keys from numeric values
    mapping: Object.fromEntries(
      Object.entries(hdf5Mapping).map(([k, v]) => [v, k]),
    ),
  };
}

export function enumOrBoolType(
  baseType: NumericType | BigIntegerType,
  hdf5Mapping: Record<string, number>,
): EnumType | BooleanType {
  if (
    Object.keys(hdf5Mapping).length === 2 &&
    hdf5Mapping.FALSE === 0 &&
    hdf5Mapping.TRUE === 1
  ) {
    return boolType();
  }

  return enumType(baseType, hdf5Mapping);
}

export function timeType(): TimeType {
  return { class: DTypeClass.Time };
}

export function bitfieldType(h5tOrder = H5T_ORDER.LE): BitfieldType {
  return {
    class: DTypeClass.Bitfield,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
  };
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
