import type {
  BooleanType,
  ChildEntity,
  ComplexType,
  CompoundType,
  DType,
  GroupWithChildren,
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

export function intType(
  size: 8 | 16 | 32 | 64 = 32,
  unsigned = false,
  endianness = Endianness.LE,
): NumericType {
  return {
    class: unsigned ? DTypeClass.Unsigned : DTypeClass.Integer,
    endianness,
    size,
  };
}

export function floatType(
  size: 16 | 32 | 64 = 32,
  endianness = Endianness.LE,
): NumericType {
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

export function unknownType(): UnknownType {
  return { class: DTypeClass.Unknown };
}
