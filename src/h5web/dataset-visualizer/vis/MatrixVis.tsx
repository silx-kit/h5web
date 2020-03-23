import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import numeral from 'numeral';
import { HDF5Value } from '../../providers/models';
import styles from './MatrixVis.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccessorFunc = (row: number, col: number) => any;

interface Props {
  dims: number[];
  data: HDF5Value;
}

function MatrixVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const accessor: AccessorFunc =
    dims.length === 1 ? row => data[row] : (row, col) => data[row][col];

  return (
    <AutoSizer>
      {({ width, height }) => (
        <Grid
          className={styles.grid}
          rowCount={dims[0]}
          rowHeight={32}
          columnCount={dims.length === 2 ? dims[1] : 1}
          columnWidth={116}
          width={width}
          height={height}
        >
          {({ columnIndex: col, rowIndex: row, style }) => (
            <div
              className={styles.cell}
              style={style}
              data-bg={(col + row) % 2 === 1 ? '' : undefined}
            >
              {numeral(accessor(row, col)).format('0.000e+0')}
            </div>
          )}
        </Grid>
      )}
    </AutoSizer>
  );
}

export default MatrixVis;
