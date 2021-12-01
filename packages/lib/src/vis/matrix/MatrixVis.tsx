import type { Primitive } from '@h5web/shared';
import type { NdArray } from 'ndarray';

import type { PrintableType } from '../models';
import Grid from './Grid';
import GridProvider from './context';

const CELL_HEIGHT = 32;

interface Props {
  dataArray: NdArray<Primitive<PrintableType>[]>;
  formatter: (value: Primitive<PrintableType>) => string;
  cellWidth: number;
  sticky: boolean;
}

function MatrixVis(props: Props) {
  const { dataArray, formatter, cellWidth, sticky } = props;
  const dims = dataArray.shape;

  const rowCount = dims[0] + 1; // includes IndexRow
  const columnCount = (dims.length === 2 ? dims[1] : 1) + 1; // includes IndexColumn

  const cellFormatter =
    dims.length === 1
      ? (row: number) => formatter(dataArray.get(row))
      : (row: number, col: number) => formatter(dataArray.get(row, col));

  return (
    <GridProvider
      rowCount={rowCount}
      columnCount={columnCount}
      cellSize={{ width: cellWidth, height: CELL_HEIGHT }}
      cellFormatter={cellFormatter}
      sticky={sticky}
    >
      <Grid />
    </GridProvider>
  );
}

export type { Props as MatrixVisProps };
export default MatrixVis;
