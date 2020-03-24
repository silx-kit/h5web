// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AccessorFunc = (row: number, col: number) => any;

export interface CellSize {
  width: number;
  height: number;
}

export interface GridSettings {
  cellSize: CellSize;
  rowCount: number;
  columnCount: number;
}
