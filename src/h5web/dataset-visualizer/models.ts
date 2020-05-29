import type ndarray from 'ndarray';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
}

export type MappingType = number | 'x' | 'y';
export type DimensionMapping = MappingType[];

export type ScalarData = string | number;
export type DataArray = ndarray<number>;
