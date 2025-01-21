import { isNumericType } from './guards';
import {
  H5T_CSET,
  H5T_ORDER,
  H5T_STR,
  H5T_TO_CHAR_SET,
  H5T_TO_ENDIANNESS,
  H5T_TO_STR_PAD,
} from './h5t';
import {
  type ArrayType,
  type BitfieldType,
  type BooleanType,
  type ChildEntity,
  type ComplexType,
  type CompoundType,
  type DType,
  DTypeClass,
  type EnumType,
  type FloatType,
  type GroupWithChildren,
  type H5WebComplex,
  type IntegerType,
  type NumericType,
  type OpaqueType,
  type PrintableType,
  type ReferenceType,
  type StringType,
  type TimeType,
  type UnknownType,
} from './hdf5-models';

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

export function getNameFromPath(path: string): string {
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
    endianness: H5T_TO_ENDIANNESS[h5tOrder],
    size,
  };
}

export function floatType(size = 32, h5tOrder = H5T_ORDER.LE): FloatType {
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

export function cplxType(
  realType: NumericType,
  imagType = realType,
): ComplexType {
  return { class: DTypeClass.Complex, realType, imagType };
}

export function compoundType<T extends DType>(
  fields: Record<string, T>,
): CompoundType<T> {
  return { class: DTypeClass.Compound, fields };
}

export const printableCompoundType = compoundType<PrintableType>;

export function compoundOrCplxType<T extends DType>(
  fields: Record<string, T>,
): CompoundType<T> | ComplexType {
  const { r, i } = fields;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

export function boolType(baseType: NumericType): BooleanType {
  return { class: DTypeClass.Bool, base: baseType };
}

export function enumType(
  baseType: NumericType,
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
  baseType: NumericType,
  hdf5Mapping: Record<string, number>,
): EnumType | BooleanType {
  if (
    Object.keys(hdf5Mapping).length === 2 &&
    hdf5Mapping.FALSE === 0 &&
    hdf5Mapping.TRUE === 1
  ) {
    return boolType(baseType);
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
