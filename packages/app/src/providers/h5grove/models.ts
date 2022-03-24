import type { AttributeValues, EntityKind } from '@h5web/shared';

export interface H5GroveEntityResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'external_link'
    | 'soft_link'
    | 'other';
}

export interface H5GroveDatasetResponse extends H5GroveEntityResponse {
  type: EntityKind.Dataset;
  dtype: string;
  shape: number[];
  attributes: H5GroveAttribute[];
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
  dtype: string;
  name: string;
  shape: number[];
}

export type H5GroveAttrValuesResponse = AttributeValues;
export type H5GroveDataResponse = unknown;
