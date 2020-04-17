import React from 'react';
import { Dom, useThree } from 'react-three-fiber';
import IndexAxis from './IndexAxis';
import styles from './HeatmapVis.module.css';

interface Props {
  dims: [number, number];
}

function AxisGrid(props: Props): JSX.Element {
  const { dims } = props;

  const { size } = useThree();
  const { width, height } = size;

  return (
    <Dom>
      <div className={styles.axisGrid} style={{ width, height }}>
        <IndexAxis
          className={styles.leftAxisCell}
          orientation="left"
          indicesCount={dims[0]}
        />
        <IndexAxis
          className={styles.bottomAxisCell}
          orientation="bottom"
          indicesCount={dims[1]}
        />
      </div>
    </Dom>
  );
}

export default AxisGrid;
