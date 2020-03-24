import React from 'react';
import { GridChildComponentProps } from 'react-window';
import numeral from 'numeral';
import styles from './MatrixVis.module.css';

function ValueCell(props: GridChildComponentProps): JSX.Element {
  const { data, rowIndex, columnIndex, style } = props;
  const { valueAccessor } = data;

  return (
    <div
      className={styles.cell}
      style={style}
      data-bg={(rowIndex + columnIndex) % 2 === 1 ? '' : undefined}
    >
      {numeral(valueAccessor(rowIndex, columnIndex)).format('0.000e+0')}
    </div>
  );
}

export default ValueCell;
