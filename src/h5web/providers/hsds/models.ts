import type {
  HDF5Id,
  HDF5Shape,
  HDF5Type,
  HDF5Attribute,
  HDF5Value,
  HDF5ExternalLink,
  HDF5HardLink,
  HDF5SoftLink,
  HDF5Link,
  HDF5Collection,
} from '../hdf5-models';

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

export interface HsdsExternalLink extends Omit<HDF5ExternalLink, 'file'> {
  h5domain: string;
}

export type HsdsLink = HDF5HardLink | HDF5SoftLink | HsdsExternalLink;

export interface HsdsLinksResponse {
  links: HsdsLink[];
}

export interface HsdsRootResponse {
  root: HDF5Id;
}

export interface HsdsValueResponse {
  value: HDF5Value;
}

export interface HsdsMetadata {
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, HsdsGroup>;
  [HDF5Collection.Datasets]?: Record<HDF5Id, HsdsDataset>;
  [HDF5Collection.Datatypes]?: Record<HDF5Id, HsdsDatatype>;
}

export interface HsdsGroup {
  path: string;
  attributes?: HDF5Attribute[];
  links?: HDF5Link[];
}

export interface HsdsDataset {
  path: string;
  attributes?: HDF5Attribute[];
  shape: HDF5Shape;
  type: HDF5Type;
}

export interface HsdsDatatype {
  path: string;
  type: HDF5Type;
}
