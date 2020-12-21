import type { HDF5Value } from '../hdf5-models';
import type { EntityKind } from '../models';

export interface JupyterMetaResponse {
  attributeCount: number;
  id: string;
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
  childrenCount: number;
  type: EntityKind.Group;
}

export interface JupyterContent {
  type: EntityKind;
  name: string;
  uri: string;
}

export interface JupyterContentDatasetResponse extends JupyterContent {
  content: JupyterMetaDatasetResponse;
  type: EntityKind.Dataset;
}

export type JupyterContentGroupResponse = JupyterContent[];

export type JupyterContentResponse =
  | JupyterContentDatasetResponse
  | JupyterContentGroupResponse;

export type JupyterDataResponse = HDF5Value;

export type JupyterAttrsResponse = Record<string, string>;
