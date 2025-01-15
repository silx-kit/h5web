import { useMeasure } from '@react-hookz/web';
import { useContext } from 'react';
import { FixedSizeGrid as IndexedGrid } from 'react-window';

import { type ClassStyleAttrs } from '../models';
import Cell from './Cell';
import { SettingsContext } from './context';
import styles from './MatrixVis.module.css';
import StickyGrid from './StickyGrid';

function Grid(props: ClassStyleAttrs) {
  const { className = '', style } = props;
  const { rowCount, columnCount, cellSize, setRenderedItems } =
    useContext(SettingsContext);

  const [wrapperSize, wrapperRef] = useMeasure<HTMLDivElement>();

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${className}`}
      style={style}
      data-test-size="500,500"
    >
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
          overscanColumnCount={8}
          overscanRowCount={16}
          onItemsRendered={setRenderedItems}
        >
          {Cell}
        </IndexedGrid>
      )}
    </div>
  );
}

export default Grid;
