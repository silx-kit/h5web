import { useContext } from 'react';
import type { GridChildComponentProps } from 'react-window';
import styles from './MatrixVis.module.css';
import { GridSettingsContext } from './GridSettingsContext';

function Cell(props: GridChildComponentProps) {
  const { rowIndex, columnIndex, style } = props;
  const { cellFormatter } = useContext(GridSettingsContext);

  // Disable index columns (rendering done by the innerElementType)
  if (rowIndex * columnIndex === 0) {
    return null;
  }

  return (
    <div
      className={styles.cell}
      style={style}
      role="cell"
      aria-rowindex={rowIndex}
      aria-colindex={columnIndex}
      data-bg={(rowIndex + columnIndex) % 2 === 1 ? '' : undefined}
    >
      {
        // -1 to account for the index row and column
        cellFormatter(rowIndex - 1, columnIndex - 1)
      }
    </div>
  );
}

export default Cell;
