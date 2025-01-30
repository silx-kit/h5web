import { type H5T_CSET, type H5T_STR } from '@h5web/shared/h5t';
import { type Entity } from '@h5web/shared/hdf5-models';

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
  attributes: HsdsAttribute[];
}

export interface HsdsLinksResponse {
  links: HsdsLink[];
}

export interface HsdsValueResponse {
  value: unknown;
}

export interface HsdsAttributeWithValueResponse extends HsdsAttribute {
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

/* ------------------- */
/* ----- ENTITIES----- */

export type BaseHsdsEntity = Pick<
  HsdsEntity,
  'id' | 'collection' | 'path' | 'name'
>;

export type HsdsEntity<T extends Entity = Entity> = T & {
  id: HsdsId;
  collection: HsdsCollection;
};

export interface HsdsAttribute {
  name: string;
  shape: HsdsShape;
  type: HsdsType;
}

/* ------------------------ */
/* ----- SHAPE & TYPE ----- */

export interface HsdsShape {
  class: 'H5S_SIMPLE' | 'H5S_SCALAR' | 'H5S_NUL';
  dims?: number[];
}

export type HsdsType =
  | HsdsNumericType
  | HsdsStringType
  | HsdsVLenType
  | HsdsArrayType
  | HsdsCompoundType
  | HsdsEnumType;

export interface HsdsNumericType {
  class: 'H5T_INTEGER' | 'H5T_FLOAT';
  base: string;
}

export interface HsdsStringType {
  class: 'H5T_STRING';
  charSet: `H5T_CSET_${keyof typeof H5T_CSET}`;
  strPad: `H5T_STR_${keyof typeof H5T_STR}`;
  length: number | 'H5T_VARIABLE';
}

export interface HsdsVLenType {
  class: 'H5T_VLEN';
  base: HsdsType;
}

export interface HsdsArrayType {
  class: 'H5T_ARRAY';
  base: HsdsType;
  dims: number[];
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
