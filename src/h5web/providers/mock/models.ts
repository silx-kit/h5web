import type { Dataset, DType, Shape } from '../models';
import type { mockValues } from './values';

export interface MockDataset<S extends Shape = Shape, T extends DType = DType>
  extends Dataset<S, T> {
  value: unknown;
}

export type MockValueId = keyof typeof mockValues;
