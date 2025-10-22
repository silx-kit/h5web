import { type ArrayShape } from '@h5web/shared/hdf5-models';
import { useMemo, useState } from 'react';
import { Grid } from 'react-window';
import { useStore } from 'zustand';

import { type ClassStyleAttrs } from '../models';
import Cell from './Cell';
import styles from './MatrixVis.module.css';
import StickyIndices from './StickyIndices';
import { createRenderedCellsStore } from './store';
import { CELL_HEIGHT } from './utils';

interface Props extends ClassStyleAttrs {
  dims: ArrayShape;
  cellFormatter: (row: number, col: number) => string;
  cellWidth: number;
  columnHeaders?: string[];
}

function MatrixVis(props: Props) {
  const {
    dims,
    cellFormatter,
    cellWidth,
    columnHeaders,
    className = '',
    style,
  } = props;
  const [rowCount, columnCount = 1] = dims;

  const [store] = useState(createRenderedCellsStore);
  const setRenderedCells = useStore(store, (state) => state.setRenderedCells);

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <Grid
        className={styles.grid}
        cellComponent={Cell}
        cellProps={useMemo(() => ({ cellFormatter }), [cellFormatter])}
        rowCount={rowCount}
        rowHeight={CELL_HEIGHT}
        columnCount={columnCount}
        columnWidth={cellWidth}
        overscanCount={10}
        onCellsRendered={(_, allCells) => setRenderedCells(allCells)}
      >
        <StickyIndices
          store={store}
          columnWidth={cellWidth}
          columnHeaders={columnHeaders}
        />
      </Grid>
    </div>
  );
}

export type { Props as MatrixVisProps };
export default MatrixVis;
