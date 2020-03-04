import {
  HDF5Id,
  HDF5Collection,
  HDF5Group,
  HDF5Dataset,
  HDF5Datatype,
} from '../../h5web/providers/models';

export interface MockHDF5Metadata {
  id?: HDF5Id;
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, HDF5Group>;
  [HDF5Collection.Datasets]?: Record<HDF5Id, HDF5Dataset>;
  [HDF5Collection.Datatypes]?: Record<HDF5Id, HDF5Datatype>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockHDF5Values = Record<HDF5Id, any>;
