import { useMeasure } from '@react-hookz/web';
import { useContext } from 'react';
import { FixedSizeGrid as IndexedGrid } from 'react-window';

import Cell from './Cell';
import styles from './MatrixVis.module.css';
import StickyGrid from './StickyGrid';
import { SettingsContext } from './context';

function Grid() {
  const { rowCount, columnCount, cellSize, setRenderedItems } =
    useContext(SettingsContext);

  const [wrapperSize, wrapperRef] = useMeasure<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {wrapperSize && (
        <IndexedGrid
          className={styles.grid}
          innerElementType={StickyGrid}
          width={wrapperSize.width}
          height={wrapperSize.height}
          rowHeight={cellSize.height}
          rowCount={rowCount}
          columnWidth={cellSize.width}
          columnCount={columnCount}
          overscanCount={8}
          onItemsRendered={setRenderedItems}
        >
          {Cell}
        </IndexedGrid>
      )}
    </div>
  );
}

export default Grid;
