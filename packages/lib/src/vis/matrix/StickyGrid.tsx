import type { ReactNode } from 'react';
import { useContext, forwardRef } from 'react';

import HeaderCells from './HeaderCells';
import styles from './MatrixVis.module.css';
import { SettingsContext, RenderedItemsContext } from './context';

interface Props {
  children: ReactNode;
  style: React.CSSProperties;
}

const StickyGrid = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, style } = props;
  const { rowCount, columnCount, cellSize, sticky } =
    useContext(SettingsContext);

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
      style={style}
      role="table"
      aria-rowcount={rowCount}
      aria-colcount={columnCount}
      data-sticky={sticky || undefined}
    >
      <div className={styles.colHeaders}>
        <div className={styles.topLeftCell} style={cellSize} data-bg />
        <HeaderCells
          indexMin={colStart}
          indexMax={colStop}
          transform={`translateX(${cellSize.width * colStart}px)`}
        />
      </div>
      <div className={styles.innerContainer}>
        <div className={styles.rowHeaders}>
          <HeaderCells
            indexMin={rowStart}
            indexMax={rowStop}
            transform={`translateY(${cellSize.height * rowStart}px)`}
          />
        </div>
        {children}
      </div>
    </div>
  );
});

export default StickyGrid;
