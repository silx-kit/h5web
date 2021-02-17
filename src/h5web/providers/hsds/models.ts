import type {
  HDF5Id,
  HDF5Shape,
  HDF5Attribute,
  HDF5Value,
  HDF5ExternalLink,
  HDF5HardLink,
  HDF5SoftLink,
  HDF5TypeClass,
  HDF5Dims,
} from '../hdf5-models';
import type { Dataset, Group } from '../models';

export type HsdsBaseType =
  | { class: HDF5TypeClass.Integer; base: string }
  | { class: HDF5TypeClass.Float; base: string }
  | {
      class: HDF5TypeClass.String;
      charSet: 'H5T_CSET_ASCII' | 'H5T_CSET_UTF8';
      strPad: 'H5T_STR_SPACEPAD' | 'H5T_STR_NULLTERM' | 'H5T_STR_NULLPAD';
      length: number | 'H5T_VARIABLE';
    };

export type HsdsType =
  | HsdsBaseType
  | HsdsArrayType
  | HsdsVLenType
  | HsdsCompoundType
  | HsdsEnumType
  | HDF5Id;

export interface HsdsArrayType {
  class: HDF5TypeClass.Array;
  base: HsdsBaseType;
  dims: HDF5Dims;
}

export interface HsdsVLenType {
  class: HDF5TypeClass.VLen;
  base: HsdsBaseType;
}

export interface HsdsCompoundType {
  class: HDF5TypeClass.Compound;
  fields: HsdsCompoundTypeField[];
}

export interface HsdsEnumType {
  class: HDF5TypeClass.Enum;
  base: HsdsBaseType;
  mapping: Record<string, number>;
}

interface HsdsCompoundTypeField {
  name: string;
  type: HsdsType;
}

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
  type: HsdsType;
  attributeCount: number;
}

export interface HsdsDatatypeResponse {
  id: HDF5Id;
  type: HsdsType;
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

export interface HsdsGroup extends Group {
  id: HDF5Id;
}

export interface HsdsDataset extends Dataset {
  id: HDF5Id;
}

export interface HsdsValueResponse {
  value: HDF5Value;
}
