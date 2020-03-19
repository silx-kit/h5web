import {
  HDF5Value,
  HDF5Id,
  HDF5Collection,
  HDF5Entity,
  HDF5Group,
  HDF5Dataset,
  HDF5Datatype,
} from '../models';

type BareEntity<T extends HDF5Entity> = Omit<T, 'id' | 'collection'>;

export interface SilxMetadataResponse {
  root: HDF5Id;
  [HDF5Collection.Groups]: Record<HDF5Id, BareEntity<HDF5Group>>;
  [HDF5Collection.Datasets]?: Record<HDF5Id, BareEntity<HDF5Dataset>>;
  [HDF5Collection.Datatypes]?: Record<HDF5Id, BareEntity<HDF5Datatype>>;
}

export type SilxValuesResponse = Record<string, HDF5Value>;
