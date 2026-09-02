import {
  type Attribute,
  type Dataset,
  type DimensionScales,
  type DType,
  type Shape,
} from './hdf5-models';
import { type mockValues } from './mock-values';

export interface MockDataset<
  S extends Shape = Shape,
  T extends DType = DType,
> extends Dataset<S, T> {
  value: unknown;
  dimScales?: DimensionScales; // HDF5 dimension scales, as returned by the provider
}

export interface MockAttribute<
  S extends Shape = Shape,
  T extends DType = DType,
> extends Attribute<S, T> {
  value: unknown;
}

export type MockValueId = keyof typeof mockValues;
