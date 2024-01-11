import type {
  ArrayType,
  BooleanType,
  ChildEntity,
  ComplexType,
  CompoundType,
  DType,
  EnumType,
  GroupWithChildren,
  H5WebComplex,
  NumericType,
  PrintableCompoundType,
  PrintableType,
  StringType,
  UnknownType,
} from './hdf5-models';
import { DTypeClass, Endianness } from './hdf5-models';

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

export function floatType(size = 32, endianness = Endianness.LE): NumericType {
  return { class: DTypeClass.Float, endianness, size };
}

export function strType(
  charSet: StringType['charSet'] = 'ASCII',
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

export function compoundType(fields: Record<string, DType>): CompoundType {
  return { class: DTypeClass.Compound, fields };
}

export function printableCompoundType(
  fields: Record<string, PrintableType>,
): PrintableCompoundType {
  return { class: DTypeClass.Compound, fields };
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

export function unknownType(): UnknownType {
  return { class: DTypeClass.Unknown };
}

/* ------------------ */
/* ----- VALUES ----- */

export function cplx(real: number, imag: number): H5WebComplex {
  return [real, imag];
}
