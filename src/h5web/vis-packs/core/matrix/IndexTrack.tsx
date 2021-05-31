import { ReactNode, useContext } from 'react';
import { range } from 'lodash';
import { GridSettingsContext } from './GridSettingsContext';
import styles from './MatrixVis.module.css';

interface Props {
  cellCount: number;
  className: string;
  children?: ReactNode;
}

function IndexTrack(props: Props) {
  const { cellCount, className, children } = props;
  const { cellSize } = useContext(GridSettingsContext);

  return (
    <div className={className}>
      {children}
      {range(cellCount).map((index) => (
        <div
          key={index.toString()}
          className={styles.indexCell}
          style={cellSize}
          data-bg={index % 2 === 1 ? '' : undefined}
        >
          {index >= 0 && index}
        </div>
      ))}
    </div>
  );
}

export default IndexTrack;
