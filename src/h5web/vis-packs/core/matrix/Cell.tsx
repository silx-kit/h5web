import { useContext } from 'react';
import type { GridChildComponentProps } from 'react-window';
import { format } from 'd3-format';
import styles from './MatrixVis.module.css';
import { GridSettingsContext } from './GridSettingsContext';
import type { Primitive } from '../../../providers/models';
import type { PrintableType } from '../models';
import { formatComplexValue } from '../../../utils';

function formatPrintableValue(value: Primitive<PrintableType>) {
  if (Array.isArray(value)) {
    return formatComplexValue(value, '.1g');
  }

  if (typeof value === 'number') {
    return format('.3e')(value);
  }

  return value.toString();
}

function Cell(props: GridChildComponentProps) {
  const { rowIndex, columnIndex, style } = props;
  const { valueAccessor } = useContext(GridSettingsContext);

  // Disable index columns (rendering done by the innerElementType)
  if (rowIndex * columnIndex === 0) {
    return null;
  }

  // -1 to account for the index row and column
  const dataValue = valueAccessor(rowIndex - 1, columnIndex - 1);

  return (
    <div
      className={styles.cell}
      style={style}
      role="cell"
      aria-rowindex={rowIndex}
      aria-colindex={columnIndex}
      data-bg={(rowIndex + columnIndex) % 2 === 1 ? '' : undefined}
    >
      {formatPrintableValue(dataValue)}
    </div>
  );
}

export default Cell;
