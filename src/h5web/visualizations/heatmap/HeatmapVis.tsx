import { Canvas } from 'react-three-fiber';
import React from 'react';
import { interpolateMagma } from 'd3-scale-chromatic';
import Mesh from './Mesh';
import { computeTextureData, findDomain } from './utils';
import styles from './HeatmapVis.module.css';
import IndexAxis from './IndexAxis';
import ColorBar from './ColorBar';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const values = data.flat();

  const interpolator = interpolateMagma;
  const domain = findDomain(values);
  const textureData = computeTextureData(values, domain, interpolator);

  return (
    <div className={styles.chart}>
      <div className={styles.mapArea}>
        <Canvas className={styles.heatmap} orthographic invalidateFrameloop>
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
      {domain && (
        <ColorBar
          className={styles.rightArea}
          interpolator={interpolator}
          dataBounds={domain}
        />
      )}
    </div>
  );
}

export default HeatmapVis;
