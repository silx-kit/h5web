import React, { useState, forwardRef, Ref } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import StickyProvider from './StickyContext';
import styles from './MatrixVis.module.css';
import AnchorCell from './AnchorCell';
import IndexTrack from './IndexTrack';
import { GridSettings } from './utils';

interface Props {
  children: (props: GridChildComponentProps) => JSX.Element;
  itemData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  gridSettings: GridSettings;
  width: number;
  height: number;
}

// IndexedGrid based on https://codesandbox.io/s/0mk3qwpl4l
// Wrapper around FixedSizeGrid to add indices row and column (sticky or not).
function IndexedGrid(props: Props): JSX.Element {
  const {
    children: NormalCellFunc,
    width,
    height,
    gridSettings,
    itemData,
  } = props;
  const { cellSize, columnCount, rowCount } = gridSettings;

  const [stickyState, setStickyState] = useState(true);
  function toggleStickyIndices(): void {
    setStickyState(!stickyState);
  }

  const InnerGrid = forwardRef(({ children: innerChildren, ...rest }, ref) => {
    return (
      <div ref={ref as Ref<HTMLDivElement>} {...rest}>
        <IndexTrack
          anchorCell
          cellSize={cellSize}
          cellCount={columnCount - 1}
          className={styles.indexRow}
        />
        <div className={styles.rowContainer}>
          <IndexTrack
            cellSize={cellSize}
            cellCount={rowCount - 1}
            className={styles.indexColumn}
          />
          {innerChildren}
        </div>
      </div>
    );
  });

  return (
    <StickyProvider
      stickyIndices={stickyState}
      toggleStickyIndices={toggleStickyIndices}
    >
      <Grid
        itemData={itemData}
        innerElementType={InnerGrid}
        className={styles.grid}
        columnWidth={cellSize.width}
        rowHeight={cellSize.height}
        columnCount={columnCount}
        rowCount={rowCount}
        width={width}
        height={height}
      >
        {(cellProps: GridChildComponentProps) => {
          const { data: cellData, rowIndex, columnIndex, style } = cellProps;
          // Disable rendering of index columns (done by the innerElementType)
          if (rowIndex * columnIndex === 0) {
            return <></>;
          }
          return (
            <NormalCellFunc
              data={cellData}
              rowIndex={rowIndex - 1}
              columnIndex={columnIndex - 1}
              style={style}
            />
          );
        }}
      </Grid>
    </StickyProvider>
  );
}

export default IndexedGrid;
