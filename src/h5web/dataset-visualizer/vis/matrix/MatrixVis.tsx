import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { HDF5Value } from '../../../providers/models';
import ValueCell from './ValueCell';
import IndexedGrid from './IndexedGrid';
import { AccessorFunc } from './utils';

interface Props {
  dims: number[];
  data: HDF5Value;
}

function MatrixVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const myGridSettings = {
    cellSize: { width: 116, height: 32 },
    rowCount: dims[0] + 1, // includes IndexRow
    columnCount: (dims.length === 2 ? dims[1] : 1) + 1, // includes IndexColumn
  };

  const valueAccessor: AccessorFunc =
    dims.length === 1 ? row => data[row] : (row, col) => data[row][col];

  return (
    <AutoSizer>
      {({ width, height }) => (
        <IndexedGrid
          itemData={{ valueAccessor }}
          width={width}
          height={height}
          gridSettings={myGridSettings}
        >
          {ValueCell}
        </IndexedGrid>
      )}
    </AutoSizer>
  );
}

export default MatrixVis;
