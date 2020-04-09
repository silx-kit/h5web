import { Canvas } from 'react-three-fiber';
import React, { useMemo } from 'react';
import Mesh from './Mesh';
import { computeTextureData } from './utils';
import styles from './HeatmapVis.module.css';
import IndexAxis from './IndexAxis';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const textureData = useMemo(() => computeTextureData(data), [data]);

  return (
    <div className={styles.chart}>
      <div className={styles.mapArea}>
        <Canvas className={styles.heatmap} orthographic>
          <ambientLight />
          {textureData && <Mesh dims={dims} textureData={textureData} />}
        </Canvas>
      </div>
      <IndexAxis
        className={styles.leftArea}
        orientation="left"
        numberPixels={dims[0]}
      />
      <IndexAxis
        className={styles.bottomArea}
        orientation="bottom"
        numberPixels={dims[1]}
      />
    </div>
  );
}

export default HeatmapVis;
