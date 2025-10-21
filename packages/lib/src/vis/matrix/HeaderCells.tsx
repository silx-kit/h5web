import { range } from 'd3-array';

import styles from './MatrixVis.module.css';

interface Props {
  width: number;
  height: number;
  indexMin: number;
  indexMax: number;
  transform: string; // to compensate for header cells not rendered in the range [0, indexMin]
  headers?: string[];
}

function HeaderCells(props: Props) {
  const { width, height, indexMin, indexMax, transform, headers } = props;

  return range(indexMin, indexMax + 1).map((index) => (
    <div
      key={index.toString()}
      className={styles.indexCell}
      style={{ width, height, transform }}
      data-bg={index % 2 === 1 ? '' : undefined}
      {...(headers
        ? { role: 'columnheader', 'aria-colindex': index + 1 }
        : { 'aria-hidden': 'true' })}
    >
      {headers?.[index] || index}
    </div>
  ));
}

export default HeaderCells;
