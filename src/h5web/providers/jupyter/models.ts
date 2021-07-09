import type { EntityKind } from '../models';

export interface JupyterEntityResponse {
  type: EntityKind.Group | EntityKind.Dataset;
  name: string;
  attributes: JupyterAttribute[];
}

export interface JupyterDatasetResponse extends JupyterEntityResponse {
  type: EntityKind.Dataset;
  dtype: string;
  ndim: number;
  shape: number[];
  size: number;
}

export interface JupyterGroupResponse extends JupyterEntityResponse {
  type: EntityKind.Group;
  children?: JupyterEntityResponse[];
}

export interface JupyterAttribute {
  name: string;
  dtype: string;
  shape: number[];
}

export type JupyterDataResponse = unknown;
export type JupyterAttrValuesResponse = Record<string, unknown>;
