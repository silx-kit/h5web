import type { Attribute, EntityKind } from '../models';

export interface JupyterMetaResponse {
  name: string;
  type: EntityKind.Group | EntityKind.Dataset;
}

export interface JupyterMetaDatasetResponse extends JupyterMetaResponse {
  dtype: string;
  ndim: number;
  shape: number[];
  size: number;
  type: EntityKind.Dataset;
}

export interface JupyterMetaGroupResponse extends JupyterMetaResponse {
  type: EntityKind.Group;
}

interface JupyterContent {
  type: EntityKind;
  name: string;
  uri: string;
}

interface JupyterContentDatasetResponse extends JupyterContent {
  content: JupyterMetaDatasetResponse;
  type: EntityKind.Dataset;
}

export type JupyterContentGroupResponse = JupyterContent[];

export type JupyterContentResponse =
  | JupyterContentDatasetResponse
  | JupyterContentGroupResponse;

export type JupyterDataResponse = unknown;

export type JupyterAttrsResponse = Record<string, string>;

export type JupyterComplex = JupyterComplex[] | JupyterComplexValue;
export type JupyterComplexValue =
  | `(${'' | '-'}${number}${'+' | '-'}${number}j)`
  | `${'' | '-'}${number}j`;

export interface JupyterBaseEntity {
  name: string;
  path: string;
  attributes: Attribute[];
}
