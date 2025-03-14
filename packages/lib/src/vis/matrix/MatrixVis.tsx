import { type ArrayShape } from '@h5web/shared/hdf5-models';

import { type ClassStyleAttrs } from '../models';
import GridProvider from './context';
import Grid from './Grid';

const ROW_HEADERS_WIDTH = 80;
const CELL_HEIGHT = 32;

interface Props extends ClassStyleAttrs {
  dims: ArrayShape;
  cellFormatter: (row: number, col: number) => string;
  cellWidth: number;
  sticky?: boolean;
  columnHeaders?: string[];
}

function MatrixVis(props: Props) {
  const {
    dims,
    cellFormatter,
    cellWidth,
    sticky = true,
    columnHeaders,
    className = '',
    style,
  } = props;
  const [rowCount, columnCount = 1] = dims;

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
      <Grid className={className} style={style} />
    </GridProvider>
  );
}

export type { Props as MatrixVisProps };
export default MatrixVis;
