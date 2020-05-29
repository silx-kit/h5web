export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
}

export type MappingType = number | 'x' | 'y';

export type DimensionMapping = MappingType[];
