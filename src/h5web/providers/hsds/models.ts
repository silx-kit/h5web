import type { Entity } from '../models';

/* --------------------- */
/* ----- RESPONSES ----- */

export type HsdsId = string;

export interface HsdsRootResponse {
  root: HsdsId;
}

export interface HsdsGroupResponse {
  id: HsdsId;
  linkCount: number;
  attributeCount: number;
}

export interface HsdsDatasetResponse {
  id: HsdsId;
  shape: HsdsShape;
  type: HsdsType;
  attributeCount: number;
}

export interface HsdsDatatypeResponse {
  id: HsdsId;
  type: HsdsType;
}

export interface HsdsAttributesResponse {
  attributes: Omit<HsdsAttributeResponse, 'value'>[];
}

export interface HsdsAttributeResponse {
  name: string;
  shape: HsdsShape;
  type: HsdsType;
  value: unknown;
}

export interface HsdsLinksResponse {
  links: HsdsLink[];
}

export interface HsdsValueResponse {
  value: unknown;
}

/* ----------------- */
/* ----- LINKS ----- */

export type HsdsLink = HsdsHardLink | HsdsSymbolicLink;
export type HsdsCollection = 'groups' | 'datasets' | 'datatypes';

interface HsdsHardLink {
  class: 'H5L_TYPE_HARD';
  title: string;
  collection: HsdsCollection;
  id: HsdsId;
}

interface HsdsSymbolicLink {
  class: 'H5L_TYPE_SOFT' | 'H5L_TYPE_EXTERNAL';
  title: string;
  file?: string;
  h5path: string;
}

/* ---------------------------- */
/* ----- ENTITIES & VALUES----- */

export type HsdsEntity<T extends Entity = Entity> = T & { id: HsdsId };

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
