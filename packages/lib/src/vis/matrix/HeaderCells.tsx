import { range } from 'd3-array';
import { useContext } from 'react';

import { SettingsContext } from './context';
import styles from './MatrixVis.module.css';

interface Props {
  indexMin: number;
  indexMax: number;
  transform: string; // to compensate for header cells not rendered in the range [0, indexMin]
  width?: number;
  headers?: string[];
}

function HeaderCells(props: Props) {
  const { indexMin, indexMax, width, transform, headers } = props;
  const { cellSize } = useContext(SettingsContext);

  return range(indexMin, indexMax + 1).map((index) => (
    <div
      key={index.toString()}
      className={styles.indexCell}
      style={{
        width: width || cellSize.width,
        height: cellSize.height,
        transform,
      }}
      data-bg={index % 2 === 1 ? '' : undefined}
    >
      {index >= 0 && headers ? headers[index] : index}
    </div>
  ));
}

export default HeaderCells;
