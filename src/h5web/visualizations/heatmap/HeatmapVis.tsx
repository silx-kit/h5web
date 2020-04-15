import { Canvas } from 'react-three-fiber';
import React, { useState } from 'react';
import Mesh from './Mesh';
import { computeTextureData, findDomain } from './utils';
import styles from './HeatmapVis.module.css';
import IndexAxis from './IndexAxis';
import ColorBar from './ColorBar';
import ColorMapSelector from './ColorMapSelector';
import { ColorMap, INTERPOLATORS } from './interpolators';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const values = data.flat();

  const domain = findDomain(values);
  const [colorMap, setColorMap] = useState<ColorMap>('Magma');
  const textureData = computeTextureData(
    values,
    domain,
    INTERPOLATORS[colorMap]
  );

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
          interpolator={INTERPOLATORS[colorMap]}
          dataBounds={domain}
        />
      )}
      <ColorMapSelector
        className={styles.bottomRightArea}
        currentColorMap={colorMap}
        changeColorMap={setColorMap}
      />
    </div>
  );
}

export default HeatmapVis;
