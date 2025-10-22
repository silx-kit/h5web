import { useStore } from 'zustand';

import HeaderCells from './HeaderCells';
import styles from './MatrixVis.module.css';
import { type RenderedCellsStore } from './store';
import { CELL_HEIGHT, ROW_HEADERS_WIDTH } from './utils';

interface Props {
  store: RenderedCellsStore;
  columnWidth: number;
  columnHeaders?: string[];
}

function StickyIndices(props: Props) {
  const { store, columnWidth, columnHeaders } = props;

  const { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex } =
    useStore(store, (state) => state.renderedCells);

  return (
    <>
      <div
        className={styles.colHeaders}
        role={columnHeaders ? 'row' : undefined}
      >
        <div
          className={styles.topLeftCell}
          style={{ width: ROW_HEADERS_WIDTH, height: CELL_HEIGHT }}
          data-bg
        />
        <HeaderCells
          indexMin={columnStartIndex}
          indexMax={columnStopIndex}
          transform={`translateX(${columnWidth * columnStartIndex}px)`}
          headers={columnHeaders}
          width={columnWidth}
          height={CELL_HEIGHT}
        />
      </div>
      <div className={styles.rowHeaders}>
        <HeaderCells
          indexMin={rowStartIndex}
          indexMax={rowStopIndex}
          transform={`translateY(${CELL_HEIGHT * rowStartIndex}px)`}
          width={ROW_HEADERS_WIDTH}
          height={CELL_HEIGHT}
        />
      </div>
    </>
  );
}

export default StickyIndices;
