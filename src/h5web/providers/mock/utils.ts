import mockData from './data.json';

type TwoDDataset = {
  value: number[][];
  shape: { dims: number[] };
};

export function getMocked2dDataset(): TwoDDataset {
  const dataset = Object.values(mockData.datasets).find(
    (d) => d.alias[0] === '/nD/twoD'
  ) as TwoDDataset;
  return dataset;
}

type OneDDataset = {
  value: number[];
  shape: { dims: number[] };
};

export function getMocked1dDataset(): OneDDataset {
  const dataset = Object.values(mockData.datasets).find(
    (d) => d.alias[0] === '/nD/oneD'
  ) as OneDDataset;
  return dataset;
}
