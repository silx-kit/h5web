export enum Notation {
  Auto = 'Auto',
  Scientific = 'Scientific',
  Exact = 'Exact',
}

export interface RenderedCells {
  columnStartIndex: number;
  columnStopIndex: number;
  rowStartIndex: number;
  rowStopIndex: number;
}
