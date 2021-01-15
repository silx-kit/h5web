import type {
  HDF5Id,
  HDF5Shape,
  HDF5Type,
  HDF5Attribute,
  HDF5Value,
  HDF5ExternalLink,
  HDF5HardLink,
  HDF5SoftLink,
} from '../hdf5-models';

export interface HsdsRootResponse {
  root: HDF5Id;
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
  attributes: Omit<HDF5Attribute, 'value'>[];
}

export type HsdsAttributeWithValueResponse = HDF5Attribute;

export interface HsdsLinksResponse {
  links: HsdsLink[];
}

export type HsdsLink = HDF5HardLink | HDF5SoftLink | HsdsExternalLink;

export interface HsdsExternalLink extends Omit<HDF5ExternalLink, 'file'> {
  h5domain: string;
}

export interface HsdsValueResponse {
  value: HDF5Value;
}
