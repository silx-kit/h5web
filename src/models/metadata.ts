export type HDF5Id = string;

export interface HDF5Metadata {
  apiVersion: string;
  id?: HDF5Id;
  root: HDF5Id;
  groups: Record<HDF5Id, HDF5Group>;
  datasets?: Record<HDF5Id, HDF5Dataset>;
  datatypes?: Record<HDF5Id, HDF5Datatype>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HDF5Values = Record<HDF5Id, any>;

export interface HDF5Group {
  links?: HDF5Link[];
}

export interface HDF5Dataset {
  type: HDF5Id | object;
  shape: object;
}

export interface HDF5Datatype {
  type: object;
}

export interface HDF5Link {
  class: 'H5L_TYPE_HARD';
  title: string;
  collection: HDF5Collection;
  id: HDF5Id;
}

export enum HDF5Collection {
  Groups = 'groups',
  Datasets = 'datasets',
  Datatypes = 'datatypes',
}
