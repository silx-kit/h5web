/* ------------------ */
/* ----- COMMON ----- */

export type HDF5Id = string;
export type HDF5Value = unknown;
export type HDF5Dims = number[];

export enum HDF5Collection {
  Groups = 'groups',
  Datasets = 'datasets',
  Datatypes = 'datatypes',
}

/* ----------------- */
/* ----- LINKS ----- */

export type HDF5Link = HDF5HardLink | HDF5SoftLink | HDF5ExternalLink;

export enum HDF5LinkClass {
  Hard = 'H5L_TYPE_HARD',
  Soft = 'H5L_TYPE_SOFT',
  External = 'H5L_TYPE_EXTERNAL',
}

export interface HDF5HardLink {
  class: HDF5LinkClass.Hard;
  title: string;
  collection: HDF5Collection;
  id: HDF5Id;
}

export interface HDF5SoftLink {
  class: HDF5LinkClass.Soft;
  title: string;
  h5path: string;
}

export interface HDF5ExternalLink {
  class: HDF5LinkClass.External;
  title: string;
  file: string;
  h5path: string;
}

/* ---------------- */
/* ----- TYPE ----- */

export type HDF5Type =
  | HDF5NumericType
  | HDF5StringType
  | HDF5BooleanType
  | HDF5ComplexType
  | HDF5ArrayType
  | HDF5CompoundType
  | HDF5EnumType
  | HDF5UnknownType;

export enum HDF5TypeClass {
  Bool = 'boolean',
  Integer = 'integer',
  Unsigned = 'unsigned integer',
  Float = 'float',
  Complex = 'complex',
  String = 'string',
  Compound = 'compound',
  Array = 'array',
  VLen = 'vlen',
  Enum = 'enum',
  Unknown = 'unknown',
}

export enum HDF5Endianness {
  LE = 'little-endian',
  BE = 'big-endian',
}

export interface HDF5BooleanType {
  class: HDF5TypeClass.Bool;
}

export interface HDF5NumericType {
  class: HDF5TypeClass.Integer | HDF5TypeClass.Float | HDF5TypeClass.Unsigned;
  size: number;
  endianness?: HDF5Endianness;
}

export interface HDF5ComplexType {
  class: HDF5TypeClass.Complex;
  realType: HDF5Type;
  imagType: HDF5Type;
}

export interface HDF5StringType {
  class: HDF5TypeClass.String;
  charSet: string;
  length?: number;
}

export interface HDF5CompoundType {
  class: HDF5TypeClass.Compound;
  fields: Record<string, HDF5Type>;
}

interface HDF5ArrayType {
  class: HDF5TypeClass.Array | HDF5TypeClass.VLen;
  base: HDF5Type;
  dims?: HDF5Dims;
}

interface HDF5EnumType {
  class: HDF5TypeClass.Enum;
  base: HDF5Type;
  mapping: Record<string, number>;
}

interface HDF5UnknownType {
  class: HDF5TypeClass.Unknown;
}
