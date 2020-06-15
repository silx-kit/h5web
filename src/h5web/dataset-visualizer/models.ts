import type ndarray from 'ndarray';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
}

export type Axis = 'x' | 'y';
export type MappingType = number | Axis;
export type DimensionMapping = MappingType[] | undefined;

export type DataArray = ndarray<number>;
