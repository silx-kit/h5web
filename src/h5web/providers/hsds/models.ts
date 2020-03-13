import {
  HDF5Collection,
  HDF5Id,
  HDF5Shape,
  HDF5Type,
  HDF5Link,
  HDF5Attribute,
  HDF5Group,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Value,
} from '../models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HsdsValues = any;

export interface HsdsMetadata {
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, HDF5Group>;
  [HDF5Collection.Datasets]?: Record<HDF5Id, HDF5Dataset>;
  [HDF5Collection.Datatypes]?: Record<HDF5Id, HDF5Datatype>;
}

export interface HsdsGroupResponse {
  id: HDF5Id;
  linkCount: number;
  attributeCount: number;
}

export interface HsdsDatasetResponse {
  id: HDF5Id;
  shape: HDF5Shape;
  type: HDF5Type;
  attributeCount: number;
}

export interface HsdsDatatypeResponse {
  id: HDF5Id;
  type: HDF5Type;
}

export interface HsdsAttributesResponse {
  attributes: HDF5Attribute[];
}

export interface HsdsLinksResponse {
  links: HDF5Link[];
}

export interface HsdsRootResponse {
  root: HDF5Id;
}

export interface HsdsValueResponse {
  value: HDF5Value;
}
