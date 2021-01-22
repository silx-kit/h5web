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

interface HDF5NullShape {
  class: HDF5ShapeClass.Null;
}

/* ---------------- */
/* ----- TYPE ----- */

export type HDF5Type = HDF5BaseType | HDF5AdvancedType;

// https://support.hdfgroup.org/HDF5/doc/RM/PredefDTypes.html
export type HDF5BaseType = HDF5NumericType | HDF5StringType;
export type HDF5NumericType = HDF5IntegerType | HDF5FloatType;

type HDF5AdvancedType =
  | HDF5Id
  | HDF5ArrayType
  | HDF5VLenType
  | HDF5CompoundType;

export enum HDF5TypeClass {
  Integer = 'H5T_INTEGER',
  Float = 'H5T_FLOAT',
  String = 'H5T_STRING',
  Array = 'H5T_ARRAY',
  VLen = 'H5T_VLEN',
  Compound = 'H5T_COMPOUND',
}

export interface HDF5IntegerType {
  class: HDF5TypeClass.Integer;
  base:
    | 'H5T_STD_I8BE'
    | 'H5T_STD_I8LE'
    | 'H5T_STD_I16BE'
    | 'H5T_STD_I16LE'
    | 'H5T_STD_I32BE'
    | 'H5T_STD_I32LE'
    | 'H5T_STD_I64BE'
    | 'H5T_STD_I64LE'
    | 'H5T_STD_U8BE'
    | 'H5T_STD_U8LE'
    | 'H5T_STD_U16BE'
    | 'H5T_STD_U16LE'
    | 'H5T_STD_U32BE'
    | 'H5T_STD_U32LE'
    | 'H5T_STD_U64BE'
    | 'H5T_STD_U64LE'
    | 'H5T_STD_B8BE'
    | 'H5T_STD_B8LE'
    | 'H5T_STD_B16BE'
    | 'H5T_STD_B16LE'
    | 'H5T_STD_B32BE'
    | 'H5T_STD_B32LE'
    | 'H5T_STD_B64BE'
    | 'H5T_STD_B64LE';
}

export interface HDF5FloatType {
  class: HDF5TypeClass.Float;
  base:
    | 'H5T_IEEE_F32BE'
    | 'H5T_IEEE_F32LE'
    | 'H5T_IEEE_F64BE'
    | 'H5T_IEEE_F64LE';
}

export interface HDF5StringType {
  class: HDF5TypeClass.String;
  charSet: 'H5T_CSET_ASCII' | 'H5T_CSET_UTF8';
  strPad: 'H5T_STR_SPACEPAD' | 'H5T_STR_NULLTERM' | 'H5T_STR_NULLPAD';
  length: number | 'H5T_VARIABLE';
}

interface HDF5ArrayType {
  class: HDF5TypeClass.Array;
  base: HDF5BaseType;
  dims: HDF5Dims;
}

interface HDF5VLenType {
  class: HDF5TypeClass.VLen;
  base: HDF5BaseType;
}

export interface HDF5CompoundType {
  class: HDF5TypeClass.Compound;
  fields: HDF5CompoundTypeField[];
}

interface HDF5CompoundTypeField {
  name: string;
  type: HDF5Type;
}
