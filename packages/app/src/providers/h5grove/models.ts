import type { EntityKind } from '@h5web/shared';

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
