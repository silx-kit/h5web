import type { HDF5Value } from '../hdf5-models';
import type { Dataset, DType, Shape } from '../models';
import type { mockValues } from './values';

export interface MockDataset<S extends Shape = Shape, T extends DType = DType>
  extends Dataset<S, T> {
  value: HDF5Value;
}

export type MockValueId = keyof typeof mockValues;
