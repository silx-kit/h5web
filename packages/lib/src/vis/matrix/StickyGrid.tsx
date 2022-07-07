import type { ReactNode, CSSProperties } from 'react';
import { useContext, forwardRef } from 'react';

import HeaderCells from './HeaderCells';
import styles from './MatrixVis.module.css';
import { SettingsContext, RenderedItemsContext } from './context';

interface Props {
  children: ReactNode;
  style: CSSProperties;
}

const StickyGrid = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, style } = props;
  const {
    rowCount,
    columnCount,
    cellSize,
    sticky,
    rowHeaderCellsWidth,
    columnHeaders,
  } = useContext(SettingsContext);

  const renderedItems = useContext(RenderedItemsContext);
  const {
    overscanColumnStartIndex: colStart = 0,
    overscanColumnStopIndex: colStop = 0,
    overscanRowStartIndex: rowStart = 0,
    overscanRowStopIndex: rowStop = 0,
  } = renderedItems || {};

  return (
    <div
      ref={ref}
      className={styles.stickyGrid}
      style={{
        ...style,
        width: (style.width as number) + rowHeaderCellsWidth, // account for row header cells
        height: (style.height as number) + cellSize.height, // account for column header cells
      }}
      role="table"
      aria-rowcount={rowCount}
      aria-colcount={columnCount}
      data-sticky={sticky || undefined}
    >
      <div className={styles.colHeaders}>
        <div
          className={styles.topLeftCell}
          style={{ width: rowHeaderCellsWidth, height: cellSize.height }}
          data-bg
          aria-hidden="true"
        />
        <HeaderCells
          indexMin={colStart}
          indexMax={colStop}
          transform={`translateX(${cellSize.width * colStart}px)`}
          headers={columnHeaders}
        />
      </div>
      <div className={styles.innerContainer}>
        <div className={styles.rowHeaders} aria-hidden="true">
          <HeaderCells
            indexMin={rowStart}
            indexMax={rowStop}
            transform={`translateY(${cellSize.height * rowStart}px)`}
            width={rowHeaderCellsWidth}
          />
        </div>
        {children}
      </div>
    </div>
  );
});

export default StickyGrid;
