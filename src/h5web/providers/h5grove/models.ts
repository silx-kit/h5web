import type { EntityKind } from '../models';

export type H5GroveAttrResponse = Record<string, unknown>;

export type H5GroveDataResponse = unknown;

export interface H5GroveMetaResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'externalLink'
    | 'softLink'
    | 'other';
}

export interface H5GroveSoftLinkMetaResponse extends H5GroveMetaResponse {
  target_path: string;
  type: 'softLink';
}

export interface H5GroveExternalLinkMetaResponse extends H5GroveMetaResponse {
  target_file: string;
  target_path: string;
  type: 'externalLink';
}

interface H5GroveAttrMetadata {
  dtype: string;
  name: string;
  shape: number[];
}

export interface H5GroveDatasetMetaReponse extends H5GroveMetaResponse {
  attributes: H5GroveAttrMetadata[];
  dtype: string;
  shape: number[];
  type: EntityKind.Dataset;
}

export interface H5GroveGroupMetaResponse extends H5GroveMetaResponse {
  attributes: H5GroveAttrMetadata[];
  children: H5GroveMetaResponse[];
  type: EntityKind.Group;
}
