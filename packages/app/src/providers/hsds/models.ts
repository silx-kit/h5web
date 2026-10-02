import { type H5T_CSET, type H5T_STR } from '@h5web/shared/h5t';
import {
  type Dataset,
  type Datatype,
  type Entity,
  type Group,
} from '@h5web/shared/hdf5-models';

/* --------------------- */
/* ----- RESPONSES ----- */

export type HsdsId = string;

export type HsdsEntityResponse =
  HsdsGroupResponse | HsdsDatasetResponse | HsdsDatatypeResponse;

export interface HsdsEntitiesResponse {
  h5paths: Record<string, HsdsEntityResponse>;
}

interface HsdsGroupResponse {
  id: HsdsId;
  class: 'group';
  attributes: HsdsAttribute[];
  links: Record<string, HsdsLink>;
}

interface HsdsDatasetResponse {
  id: HsdsId;
  class: 'dataset';
  shape: HsdsShape;
  type: HsdsType;
  attributes: HsdsAttribute[];
}

interface HsdsDatatypeResponse {
  id: HsdsId;
  class: 'datatype';
  type: HsdsType;
  attributes: HsdsAttribute[];
}

export interface HsdsValueResponse {
  value: unknown;
}

export interface HsdsAttributesWithValuesResponse {
  attributes: (HsdsAttribute & HsdsValueResponse)[];
}

/* ----------------- */
/* ----- LINKS ----- */

type HsdsLink = HsdsHardLink | HsdsSymbolicLink;
export type HsdsCollection = 'groups' | 'datasets' | 'datatypes';

interface HsdsHardLink {
  class: 'H5L_TYPE_HARD';
  title: string;
  collection: HsdsCollection;
  id: HsdsId;
}

export interface HsdsSymbolicLink {
  class: 'H5L_TYPE_SOFT' | 'H5L_TYPE_EXTERNAL';
  title: string;
  file?: string;
  h5path: string;
}

/* ------------------- */
/* ----- ENTITIES----- */

export type HsdsEntityFromResponse<R extends HsdsEntityResponse> =
  R extends HsdsGroupResponse
    ? HsdsEntity<Group>
    : R extends HsdsDatasetResponse
      ? HsdsEntity<Dataset>
      : HsdsEntity<Datatype>;

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

export type HsdsShape = HsdsSimpleShape | HsdsScalarShape | HsdsNulShape;

interface HsdsSimpleShape {
  class: 'H5S_SIMPLE';
  dims: [number, ...number[]];
}

interface HsdsScalarShape {
  class: 'H5S_SCALAR';
}

interface HsdsNulShape {
  class: 'H5S_NUL';
}

export type HsdsType =
  | HsdsNumericType
  | HsdsStringType
  | HsdsVLenType
  | HsdsArrayType
  | HsdsCompoundType
  | HsdsEnumType
  | HsdsReferenceType
  | HsdsOpaqueType;

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
  members: { name: string; value: number }[];
}

export interface HsdsReferenceType {
  class: 'H5T_REFERENCE';
}

export interface HsdsOpaqueType {
  class: 'H5T_OPAQUE';
}
