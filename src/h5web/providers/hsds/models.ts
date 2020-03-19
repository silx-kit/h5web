import {
  HDF5Id,
  HDF5Shape,
  HDF5Type,
  HDF5Link,
  HDF5Attribute,
  HDF5Value,
} from '../models';

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
  attributes: Omit<HDF5Attribute, 'value'>[];
}

export type HsdsAttributeWithValueResponse = HDF5Attribute;

export interface HsdsLinksResponse {
  links: HDF5Link[];
}

export interface HsdsRootResponse {
  root: HDF5Id;
}

export interface HsdsValueResponse {
  value: HDF5Value;
}
