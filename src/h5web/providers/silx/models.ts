import {
  HDF5Id,
  HDF5Collection,
  HDF5Group,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Value,
} from '../models';

export interface SilxMetadata {
  id?: HDF5Id;
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, HDF5Group>;
  [HDF5Collection.Datasets]?: Record<HDF5Id, HDF5Dataset>;
  [HDF5Collection.Datatypes]?: Record<HDF5Id, HDF5Datatype>;
}

export type SilxValues = Record<HDF5Id, HDF5Value>;
