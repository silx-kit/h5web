import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { HDF5Value } from '../providers/models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccessorFunc = (row: number, col: number) => any;

interface Props {
  dims: number[];
  data: HDF5Value;
}

function TableVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const accessor: AccessorFunc =
    dims.length === 1 ? row => data[row] : (row, col) => data[row][col];

  return (
    <AutoSizer>
      {({ width, height }) => (
        <Grid
          rowCount={dims[0]}
          rowHeight={35}
          columnCount={dims.length === 2 ? dims[1] : 1}
          columnWidth={200}
          width={width}
          height={height}
        >
          {({ columnIndex, rowIndex, style }) => (
            <div style={style}>{accessor(rowIndex, columnIndex)}</div>
          )}
        </Grid>
      )}
    </AutoSizer>
  );
}

export default TableVis;
