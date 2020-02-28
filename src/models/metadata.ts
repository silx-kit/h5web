export interface HDF5Metadata {
  apiVersion: string;
  id?: string;
  root: string;
  groups: { [id: string]: HDF5Group };
  datasets?: { [id: string]: HDF5Dataset };
}

export interface HDF5Group {
  links?: HDF5Link[];
}

interface HDF5Dataset {
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
