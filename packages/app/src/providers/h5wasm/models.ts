import type { AttributeValues, EntityKind } from '@h5web/shared';

export interface H5WasmEntityResponse {
  name: string;
  type:
    | EntityKind.Dataset
    | EntityKind.Group
    | 'external_link'
    | 'soft_link'
    | 'other';
}

export interface H5WasmDatasetReponse extends H5WasmEntityResponse {
  type: EntityKind.Dataset;
  dtype: string;
  shape: number[];
  attributes: H5WasmAttribute[];
}

export interface H5WasmGroupResponse extends H5WasmEntityResponse {
  type: EntityKind.Group;
  children?: H5WasmEntityResponse[];
  attributes: H5WasmAttribute[];
}

export interface H5WasmSoftLinkResponse extends H5WasmEntityResponse {
  type: 'soft_link';
  target_path: string;
}

export interface H5WasmExternalLinkResponse extends H5WasmEntityResponse {
  type: 'external_link';
  target_file: string;
  target_path: string;
}

export interface H5WasmAttribute {
  dtype: string;
  name: string;
  shape: number[];
}

export type H5WasmAttrValuesResponse = AttributeValues;
export type H5WasmDataResponse = unknown;
