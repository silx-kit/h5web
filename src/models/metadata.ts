export interface HDF5Metadata {
  apiVersion: string;
  id?: string;
  root: string;
  groups: Record<string, HDF5Group>;
  datasets?: Record<string, HDF5Dataset>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HDF5Values = Record<string, any>;

export interface HDF5Group {
  links?: HDF5Link[];
}

export interface HDF5Dataset {
  type: object;
  shape: object;
}

export interface HDF5Link {
  class: 'H5L_TYPE_HARD';
  title: string;
  collection: HDF5Collection;
  id: string;
}

export enum HDF5Collection {
  Groups = 'groups',
  Datasets = 'datasets',
}
