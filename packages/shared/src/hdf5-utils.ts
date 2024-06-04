import { isNumericType } from './guards';
import {
  H5T_CSET,
  H5T_ORDER,
  H5T_SIGN,
  H5T_STR,
  H5T_TO_CHAR_SET,
  H5T_TO_ENDIANNESS,
  H5T_TO_STR_PAD,
} from './h5t';
import type {
  ArrayType,
  BitfieldType,
  BooleanType,
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

export function intType(size = 32, h5tOrder = H5T_ORDER.LE): NumericType {
  return {
    class: DTypeClass.Integer,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
    size,
  };
}

export function uintType(size = 32, h5tOrder = H5T_ORDER.LE): NumericType {
  return {
    class: DTypeClass.Unsigned,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
    size,
  };
}

export function intOrUintType(
  h5tSign: H5T_SIGN,
  size = 32,
  h5tOrder = H5T_ORDER.LE,
) {
  const func = h5tSign === H5T_SIGN.SIGN_2 ? intType : uintType;
  return func(size, h5tOrder);
}

export function floatType(size = 32, h5tOrder = H5T_ORDER.LE): NumericType {
  return {
    class: DTypeClass.Float,
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
    size,
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
