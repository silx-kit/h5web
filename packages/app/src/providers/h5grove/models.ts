import type {
  AttributeValues,
  EntityKind,
  Filter,
} from '@h5web/shared/hdf5-models';

export interface H5GroveEntityResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'external_link'
    | 'soft_link'
    | 'other';
}

export type H5GroveDtype =
  | string
  | {
      [k: string]: H5GroveDtype;
    };

export interface H5GroveDatasetResponse extends H5GroveEntityResponse {
  type: EntityKind.Dataset;
  dtype: H5GroveDtype;
  shape: number[];
  attributes: H5GroveAttribute[];
  chunks: number[] | null;
  filters: Filter[] | null;
}

export interface H5GroveGroupResponse extends H5GroveEntityResponse {
  type: EntityKind.Group;
  children?: H5GroveEntityResponse[];
  attributes: H5GroveAttribute[];
}

export interface H5GroveSoftLinkResponse extends H5GroveEntityResponse {
  type: 'soft_link';
  target_path: string;
}

export interface H5GroveExternalLinkResponse extends H5GroveEntityResponse {
  type: 'external_link';
  target_file: string;
  target_path: string;
}

export interface H5GroveAttribute {
  dtype: H5GroveDtype;
  name: string;
  shape: number[];
}

export type H5GroveAttrValuesResponse = AttributeValues;
export type H5GroveDataResponse = unknown;

export type H5GrovePathsResponse = string[];
