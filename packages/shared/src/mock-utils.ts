import type { Attribute, Dataset, DType, Shape } from './hdf5-models';
import type { MockAttribute, MockDataset } from './mock-models';

export function assertMockDataset<S extends Shape, T extends DType>(
  dataset: Dataset<S, T>,
): asserts dataset is MockDataset<S, T> {
  if (!('value' in dataset)) {
    throw new Error('Expected mock dataset');
  }
}

export function assertMockAttribute<S extends Shape, T extends DType>(
  attribute: Attribute<S, T>,
): asserts attribute is MockAttribute<S, T> {
  if (!('value' in attribute)) {
    throw new Error('Expected mock attribute');
  }
}
