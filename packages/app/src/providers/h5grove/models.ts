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
  type: string;
}

export interface H5GroveGroup extends H5GroveBaseEntity {
  type: EntityKind.Group;
  children?: H5GroveEntity[];
  attributes: H5GroveAttribute[];
}

export interface H5GroveDataset extends H5GroveBaseEntity {
  type: EntityKind.Dataset;
  shape: number[];
  dtype: H5GroveDtype;
  chunks: number[] | null;
  filters: Filter[] | null;
  attributes: H5GroveAttribute[];
}

export interface H5GroveSoftLink extends H5GroveBaseEntity {
  type: 'soft_link';
  target_path: string;
}

export interface H5GroveExternalLink extends H5GroveBaseEntity {
  type: 'external_link';
  target_file: string;
  target_path: string;
}

export interface H5GroveAttribute {
  name: string;
  shape: number[];
  dtype: H5GroveDtype;
}

export type H5GroveDtype = string | { [k: string]: H5GroveDtype };
