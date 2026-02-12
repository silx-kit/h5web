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
  type ArrayShape,
  type ArrayType,
  type BitfieldType,
  type BooleanType,
  type ChildEntity,
  type ComplexType,
  type CompoundType,
  type DatasetDef,
  type DType,
  DTypeClass,
  type EnumType,
  type FloatType,
  type GroupWithChildren,
  type H5WebComplex,
  type IntegerType,
  type NullShape,
  type NumericType,
  type OpaqueType,
  type PrintableType,
  type ReferenceType,
  type ScalarShape,
  type Shape,
  ShapeClass,
  type StringType,
  type TimeType,
  type UnknownType,
  type VLenType,
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

/* --------------------- */
/* ---- DEFINITIONS ---- */

export function arrayDef<T extends DTypeClass>(
  path: string,
  type: T,
): DatasetDef<ShapeClass.Array, T> {
  return { path, shape: ShapeClass.Array, type };
}

export function scalarDef<T extends DTypeClass>(
  path: string,
  type: T,
): DatasetDef<ShapeClass.Scalar, T> {
  return { path, shape: ShapeClass.Scalar, type };
}

/* ----------------- */
/* ----- SHAPES ----- */

export function nullShape(): NullShape {
  return { class: ShapeClass.Null };
}

export function scalarShape(): ScalarShape {
  return { class: ShapeClass.Scalar, dims: [] };
}

export function arrayShape(dims: number[]): ArrayShape {
  return { class: ShapeClass.Array, dims };
}

export function parseShape(dims: number[] | null | undefined): Shape {
  if (!dims) {
    return nullShape();
  }

  if (dims.length === 0) {
    return scalarShape();
  }

  return arrayShape(dims);
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

export function vlenType<T extends DType>(baseType: T): VLenType<T> {
  return { class: DTypeClass.VLen, base: baseType };
}

export function arrayType<T extends DType>(
  baseType: T,
  dims: number[],
): ArrayType<T> {
  return { class: DTypeClass.Array, base: baseType, dims };
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
