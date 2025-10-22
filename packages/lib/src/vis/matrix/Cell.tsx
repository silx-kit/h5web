import { memo } from 'react';
import { type CellComponentProps } from 'react-window';

import styles from './MatrixVis.module.css';
import { CELL_HEIGHT, ROW_HEADERS_WIDTH } from './utils';

interface Props {
  cellFormatter: (row: number, col: number) => string;
}

function Cell(props: CellComponentProps<Props>) {
  const { ariaAttributes, rowIndex, columnIndex, style, cellFormatter } = props;

  return (
    <div
      className={styles.dataCell}
      style={{
        ...style,
        left: (style.left as number) + ROW_HEADERS_WIDTH, // account for row header cells
        top: CELL_HEIGHT, // account for column header cells
      }}
      {...ariaAttributes}
      data-bg={(rowIndex + columnIndex) % 2 === 1 || undefined}
    >
      {cellFormatter(rowIndex, columnIndex)}
    </div>
  );
}

export default memo(Cell);
