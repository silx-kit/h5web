import { memo, useContext } from 'react';
import type { GridChildComponentProps } from 'react-window';

import { SettingsContext } from './context';
import styles from './MatrixVis.module.css';

function Cell(props: GridChildComponentProps) {
  const { rowIndex, columnIndex, style } = props;
  const { rowHeaderCellsWidth, cellSize, cellFormatter } =
    useContext(SettingsContext);

  return (
    <div
      className={styles.cell}
      style={{
        ...style,
        left: (style.left as number) + rowHeaderCellsWidth, // account for row header cells
        top: (style.top as number) + cellSize.height, // account for column header cells
      }}
      role="cell"
      aria-rowindex={rowIndex}
      aria-colindex={columnIndex}
      data-bg={(rowIndex + columnIndex) % 2 === 1 || undefined}
    >
      {cellFormatter(rowIndex, columnIndex)}
    </div>
  );
}

export default memo(Cell);
