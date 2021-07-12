import type { EntityKind } from '../models';

export interface H5GroveEntityResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'externalLink'
    | 'softLink'
    | 'other';
  attributes: H5GroveAttribute[];
}

export interface H5GroveSoftLinkResponse extends H5GroveEntityResponse {
  target_path: string;
  type: 'softLink';
}

export interface H5GroveExternalLinkResponse extends H5GroveEntityResponse {
  target_file: string;
  target_path: string;
  type: 'externalLink';
}

export interface H5GroveDatasetReponse extends H5GroveEntityResponse {
  type: EntityKind.Dataset;
  dtype: string;
  shape: number[];
}

export interface H5GroveGroupResponse extends H5GroveEntityResponse {
  type: EntityKind.Group;
  children?: H5GroveEntityResponse[];
}

export interface H5GroveAttribute {
  dtype: string;
  name: string;
  shape: number[];
}

export type H5GroveAttrValuesResponse = Record<string, unknown>;
export type H5GroveDataResponse = unknown;
