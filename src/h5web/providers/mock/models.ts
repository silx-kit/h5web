import type { HDF5Shape, HDF5Type, HDF5Value } from '../hdf5-models';
import type { Dataset } from '../models';
import type { mockValues } from './values';

export interface MockDataset<
  S extends HDF5Shape = HDF5Shape,
  T extends HDF5Type = HDF5Type
> extends Dataset<S, T> {
  value: HDF5Value;
}

export type MockValueId = keyof typeof mockValues;
