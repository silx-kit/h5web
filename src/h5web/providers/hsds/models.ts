import type {
  HDF5Id,
  HDF5Value,
  HDF5ExternalLink,
  HDF5HardLink,
  HDF5SoftLink,
  HDF5TypeClass,
  HDF5Dims,
} from '../hdf5-models';
import type { Entity } from '../models';

/* --------------------- */
/* ----- RESPONSES ----- */

export interface HsdsRootResponse {
  root: HDF5Id;
}

export interface HsdsGroupResponse {
  id: HDF5Id;
  linkCount: number;
  attributeCount: number;
}

export interface HsdsDatasetResponse {
  id: HDF5Id;
  shape: HsdsShape;
  type: HsdsType;
  attributeCount: number;
}

export interface HsdsDatatypeResponse {
  id: HDF5Id;
  type: HsdsType;
}

export interface HsdsAttributesResponse {
  attributes: Omit<HsdsAttributeResponse, 'value'>[];
}

export interface HsdsAttributeResponse {
  name: string;
  shape: HsdsShape;
  type: HsdsType;
  value: HDF5Value;
}

export interface HsdsLinksResponse {
  links: HsdsLink[];
}

export interface HsdsValueResponse {
  value: HDF5Value;
}

/* ---------------------------- */
/* ----- ENTITIES & VALUES----- */

export type HsdsEntity<T extends Entity = Entity> = T & { id: HDF5Id };

export type HsdsLink = HDF5HardLink | HDF5SoftLink | HsdsExternalLink;

export interface HsdsExternalLink extends Omit<HDF5ExternalLink, 'file'> {
  h5domain: string;
}

export type HsdsComplex = HsdsComplex[] | HsdsComplexValue;
export type HsdsComplexValue = [number, number];

/* ------------------------ */
/* ----- SHAPE & TYPE ----- */

export interface HsdsShape {
  class: 'H5S_SIMPLE' | 'H5S_SCALAR' | 'H5S_NUL';
  dims?: HDF5Dims;
}

export type HsdsType =
  | HsdsIntegerType
  | HsdsFloatType
  | HsdsStringType
  | HsdsArrayType
  | HsdsVLenType
  | HsdsCompoundType
  | HsdsEnumType
  | HDF5Id;

export interface HsdsIntegerType {
  class: HDF5TypeClass.Integer;
  base: string;
}

export interface HsdsFloatType {
  class: HDF5TypeClass.Float;
  base: string;
}

export interface HsdsStringType {
  class: HDF5TypeClass.String;
  charSet: 'H5T_CSET_ASCII' | 'H5T_CSET_UTF8';
  strPad: 'H5T_STR_SPACEPAD' | 'H5T_STR_NULLTERM' | 'H5T_STR_NULLPAD';
  length: number | 'H5T_VARIABLE';
}

export interface HsdsArrayType {
  class: HDF5TypeClass.Array;
  base: HsdsType;
  dims: HDF5Dims;
}

export interface HsdsVLenType {
  class: HDF5TypeClass.VLen;
  base: HsdsType;
}

export interface HsdsCompoundType {
  class: HDF5TypeClass.Compound;
  fields: HsdsCompoundTypeField[];
}

export interface HsdsEnumType {
  class: HDF5TypeClass.Enum;
  base: HsdsType;
  mapping: Record<string, number>;
}

interface HsdsCompoundTypeField {
  name: string;
  type: HsdsType;
}
