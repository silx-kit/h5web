import type {
  HDF5Id,
  HDF5Collection,
  HDF5Group,
  HDF5Datatype,
  HDF5Dataset,
} from '../models';

export interface MockHDF5Metadata {
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, Omit<HDF5Group, 'id' | 'collection'>>;
  [HDF5Collection.Datasets]?: Record<
    HDF5Id,
    Omit<HDF5Dataset, 'id' | 'collection'>
  >;
  [HDF5Collection.Datatypes]?: Record<
    HDF5Id,
    Omit<HDF5Datatype, 'id' | 'collection'>
  >;
}
