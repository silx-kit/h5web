import { mockMetadata } from './data';
import { assertSimpleShape } from '../utils';

export function getMockDatasetDims(name: string): number[] {
  const dataset = mockMetadata.datasets?.[name];

  if (!dataset) {
    throw new Error("Dataset doesn't exist");
  }

  assertSimpleShape(dataset.shape);
  return dataset.shape.dims;
}
