import type { EntityKind } from '../models';

export type H5CoreAttrResponse = Record<string, unknown>;

export type H5CoreDataResponse = unknown;

export interface H5CoreMetaResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'externalLink'
    | 'softLink'
    | 'other';
}

export interface H5CoreSoftLinkMetaResponse extends H5CoreMetaResponse {
  target_path: string;
  type: 'softLink';
}

export interface H5CoreExternalLinkMetaResponse extends H5CoreMetaResponse {
  target_file: string;
  target_path: string;
  type: 'externalLink';
}

interface H5CoreAttrMetadata {
  dtype: string;
  name: string;
  shape: number[];
}

export interface H5CoreDatasetMetaReponse extends H5CoreMetaResponse {
  attributes: H5CoreAttrMetadata[];
  dtype: string;
  shape: number[];
  type: EntityKind.Dataset;
}

export interface H5CoreGroupMetaResponse extends H5CoreMetaResponse {
  attributes: H5CoreAttrMetadata[];
  children: H5CoreMetaResponse[];
  type: EntityKind.Group;
}
