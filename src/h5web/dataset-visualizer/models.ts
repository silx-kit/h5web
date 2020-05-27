export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
}

export interface DimensionMapping {
  x: number;
  y?: number;
  slicingIndices: Record<number, number>;
}
