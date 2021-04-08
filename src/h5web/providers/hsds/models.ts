import type {
  HDF5Id,
  HDF5Value,
  HDF5ExternalLink,
  HDF5HardLink,
  HDF5SoftLink,
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
  dims?: number[];
}

export type HsdsType =
  | HsdsNumericType
  | HsdsStringType
  | HsdsArrayType
  | HsdsCompoundType
  | HsdsEnumType;

export interface HsdsNumericType {
  class: 'H5T_INTEGER' | 'H5T_FLOAT';
  base: string;
}

export interface HsdsStringType {
  class: 'H5T_STRING';
  charSet: `H5T_CSET_${'ASCII' | 'UTF8'}`;
  length: number | 'H5T_VARIABLE';
}

export interface HsdsArrayType {
  class: 'H5T_ARRAY' | 'H5T_VLEN';
  base: HsdsType;
  dims?: number[];
}

export interface HsdsCompoundType {
  class: 'H5T_COMPOUND';
  fields: { name: string; type: HsdsType }[];
}

export interface HsdsEnumType {
  class: 'H5T_ENUM';
  base: HsdsType;
  mapping: Record<string, number>;
}
