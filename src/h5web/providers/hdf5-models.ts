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

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export interface HDF5Attribute {
  name: string;
  shape: HDF5Shape;
  type: HDF5Type;
  value: HDF5Value;
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

/* ----------------- */
/* ----- SHAPE ----- */

export type HDF5Shape = HDF5SimpleShape | HDF5ScalarShape | HDF5NullShape;

export enum HDF5ShapeClass {
  Simple = 'H5S_SIMPLE',
  Scalar = 'H5S_SCALAR',
  Null = 'H5S_NUL',
}

export interface HDF5SimpleShape {
  class: HDF5ShapeClass.Simple;
  dims: HDF5Dims;
  maxdims?: HDF5Dims;
}

export interface HDF5ScalarShape {
  class: HDF5ShapeClass.Scalar;
}

export interface HDF5NullShape {
  class: HDF5ShapeClass.Null;
}

/* ---------------- */
/* ----- TYPE ----- */

// https://support.hdfgroup.org/HDF5/doc/RM/PredefDTypes.html
export type HDF5Type =
  | HDF5NumericType
  | HDF5StringType
  | HDF5BooleanType
  | HDF5ComplexType
  | HDF5Id
  | HDF5ArrayType
  | HDF5VLenType
  | HDF5CompoundType
  | HDF5EnumType;

export type HDF5NumericType = HDF5IntegerType | HDF5FloatType;

export enum HDF5TypeClass {
  Integer = 'H5T_INTEGER',
  Float = 'H5T_FLOAT',
  String = 'H5T_STRING',
  Array = 'H5T_ARRAY',
  VLen = 'H5T_VLEN',
  Compound = 'H5T_COMPOUND',
  Enum = 'H5T_ENUM',
  Bool = 'H5T_BOOL',
  Complex = 'H5T_COMPLEX',
}

export type HDF5Endianness = 'BE' | 'LE' | 'Native' | 'Not applicable';

export interface HDF5BooleanType {
  class: HDF5TypeClass.Bool;
}

export interface HDF5ComplexType {
  class: HDF5TypeClass.Complex;
  realType: HDF5Type;
  imagType: HDF5Type;
}

export interface HDF5EnumType {
  class: HDF5TypeClass.Enum;
  base: HDF5Type;
  mapping: Record<string, number>;
}

export interface HDF5IntegerType {
  class: HDF5TypeClass.Integer;
  size: number;
  unsigned?: boolean;
  endianness: HDF5Endianness;
}

export interface HDF5FloatType {
  class: HDF5TypeClass.Float;
  size: number;
  endianness: HDF5Endianness;
}

export interface HDF5StringType {
  class: HDF5TypeClass.String;
  charSet: 'ASCII' | 'UTF8';
  length: number | 'H5T_VARIABLE';
}

interface HDF5ArrayType {
  class: HDF5TypeClass.Array;
  base: HDF5Type;
  dims: HDF5Dims;
}

interface HDF5VLenType {
  class: HDF5TypeClass.VLen;
  base: HDF5Type;
}

export interface HDF5CompoundType {
  class: HDF5TypeClass.Compound;
  fields: HDF5CompoundTypeField[];
}

interface HDF5CompoundTypeField {
  name: string;
  type: HDF5Type;
}
