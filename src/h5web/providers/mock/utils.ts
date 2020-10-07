import mockData from './data.json';
import type { HDF5SimpleShape } from '../models';

const datasets = Object.values(mockData.datasets);

export function getMockedDataset<
  T extends number[] | number[][] | number[][][] | number[][][][]
>(name: string): { value: T; dims: number[] } {
  const dataset = datasets.find((d) => d.alias[0] === name);

  return {
    value: dataset?.value as T,
    dims: (dataset?.shape as HDF5SimpleShape).dims,
  };
}
