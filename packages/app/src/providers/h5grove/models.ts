import type {
  AttributeValues,
  EntityKind,
  Filter,
} from '@h5web/shared/hdf5-models';

export type H5GroveEntityResponse = H5GroveEntity;
export type H5GroveDataResponse = unknown;
export type H5GroveAttrValuesResponse = AttributeValues;
export type H5GrovePathsResponse = string[];

export type H5GroveEntity =
  | H5GroveGroup
  | H5GroveDataset
  | H5GroveSoftLink
  | H5GroveExternalLink;

export interface H5GroveBaseEntity {
  name: string;
  kind: string;
}

export interface H5GroveGroup extends H5GroveBaseEntity {
  kind: EntityKind.Group;
  children?: H5GroveEntity[];
  attributes: H5GroveAttribute[];
}

export interface H5GroveDataset extends H5GroveBaseEntity {
  kind: EntityKind.Dataset;
  shape: number[];
  type: H5GroveType;
  chunks: number[] | null;
  filters: Filter[] | null;
  attributes: H5GroveAttribute[];
}

export interface H5GroveSoftLink extends H5GroveBaseEntity {
  kind: 'soft_link';
  target_path: string;
}

export interface H5GroveExternalLink extends H5GroveBaseEntity {
  kind: 'external_link';
  target_file: string;
  target_path: string;
}

export interface H5GroveAttribute {
  name: string;
  shape: number[];
  type: H5GroveType;
}

export type H5GroveType =
  | H5GroveIntegerType
  | H5GroveFloatType
  | H5GroveTimeType
  | H5GroveStringType
  | H5GroveBitfieldType
  | H5GroveOpaqueType
  | H5GroveCompoundType
  | H5GroveReferenceType
  | H5GroveEnumType
  | H5GroveVlenType
  | H5GroveArrayType;

export interface H5GroveBaseType {
  class: number;
  size: number;
}

export interface H5GroveIntegerType extends H5GroveBaseType {
  class: 0;
  order: number;
  sign: number;
}

export interface H5GroveFloatType extends H5GroveBaseType {
  class: 1;
  order: number;
}

export interface H5GroveTimeType extends H5GroveBaseType {
  class: 2;
}

export interface H5GroveStringType extends H5GroveBaseType {
  class: 3;
  cset: number;
  strPad?: number; // optional for backwards compatibility with h5grove <= 2.1.0
  vlen: boolean;
}

export interface H5GroveBitfieldType extends H5GroveBaseType {
  class: 4;
  order: number;
}

export interface H5GroveOpaqueType extends H5GroveBaseType {
  class: 5;
  tag: string;
}

export interface H5GroveCompoundType extends H5GroveBaseType {
  class: 6;
  members: Record<string, H5GroveType>;
}

export interface H5GroveReferenceType extends H5GroveBaseType {
  class: 7;
}

export interface H5GroveEnumType extends H5GroveBaseType {
  class: 8;
  members: Record<string, number>;
  base: H5GroveType;
}

export interface H5GroveVlenType extends H5GroveBaseType {
  class: 9;
  base: H5GroveType;
}

export interface H5GroveArrayType extends H5GroveBaseType {
  class: 10;
  dims: number[];
  base: H5GroveType;
}
