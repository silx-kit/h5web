import { mockMetadata } from './data';
import { assertSimpleShape } from '../utils';
import { assertDefined } from 'src/h5web/visualizations/shared/utils';

export function getMockDatasetDims(name: string): number[] {
  const dataset = mockMetadata.datasets?.[name];
  assertDefined(dataset, "Dataset doesn't exist");
  assertSimpleShape(dataset);
  return dataset.shape.dims;
}
