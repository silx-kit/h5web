import { type ArrayValue, type Primitive } from '@h5web/shared';
import { type NdArray } from 'ndarray';

import { type PrintableType } from '../models';
import GridProvider from './context';
import Grid from './Grid';

const ROW_HEADERS_WIDTH = 80;
const CELL_HEIGHT = 32;

interface Props {
  dataArray: NdArray<ArrayValue<PrintableType>>;
  formatter: (value: Primitive<PrintableType>, colIndex: number) => string;
  cellWidth: number;
  sticky?: boolean;
  columnHeaders?: string[];
}

function MatrixVis(props: Props) {
  const {
    dataArray,
    formatter,
    cellWidth,
    sticky = true,
    columnHeaders,
  } = props;
  const dims = dataArray.shape;

  const [rowCount, columnCount = 1] = dims;

  const cellFormatter =
    dims.length === 1
      ? (row: number) => formatter(dataArray.get(row), 0)
      : (row: number, col: number) => formatter(dataArray.get(row, col), col);

  return (
    <GridProvider
      rowCount={rowCount}
      columnCount={columnCount}
      cellSize={{ width: cellWidth, height: CELL_HEIGHT }}
      cellFormatter={cellFormatter}
      sticky={sticky}
      rowHeaderCellsWidth={ROW_HEADERS_WIDTH}
      columnHeaders={columnHeaders}
    >
      <Grid />
    </GridProvider>
  );
}

export { type Props as MatrixVisProps };
export default MatrixVis;
