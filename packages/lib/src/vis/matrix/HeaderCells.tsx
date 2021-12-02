import { range } from 'lodash';
import { useContext } from 'react';

import styles from './MatrixVis.module.css';
import { SettingsContext } from './context';

interface Props {
  indexMin: number;
  indexMax: number;
  transform: string /* to compensate for header cells not rendered in the range [0 indexMin] */;
}

function HeaderCells(props: Props) {
  const { indexMin, indexMax, transform } = props;
  const { cellSize } = useContext(SettingsContext);

  return (
    <>
      {range(indexMin, indexMax).map((index) => (
        <div
          key={index.toString()}
          className={styles.indexCell}
          style={{ ...cellSize, transform }}
          data-bg={index % 2 === 1 ? '' : undefined}
        >
          {index >= 0 && index}
        </div>
      ))}
    </>
  );
}

export default HeaderCells;
