import { Canvas } from 'react-three-fiber';
import React, { useEffect, useMemo } from 'react';
import Mesh from './Mesh';
import { computeTextureData, getDataScale } from './utils';
import styles from './HeatmapVis.module.css';
import IndexAxis from './IndexAxis';
import ColorBar from './ColorBar';
import ColorMapSelector from './ColorMapSelector';
import LogScaleToggler from './LogScaleToggler';
import { useHeatmapState, useHeatmapActions } from './store';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const { domain, interpolator, hasLogScale } = useHeatmapState();
  const { findDomain } = useHeatmapActions();

  const values = useMemo(() => data.flat(), [data]);

  useEffect(() => {
    findDomain(values);
  }, [findDomain, values]);

  const dataScale = getDataScale(domain, hasLogScale);
  const textureData = useMemo(
    () => computeTextureData(values, interpolator, dataScale),
    [dataScale, interpolator, values]
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
      {dataScale && (
        <div className={styles.rightArea}>
          <LogScaleToggler />
          <ColorBar dataScale={dataScale} />
        </div>
      )}
      <ColorMapSelector className={styles.bottomRightArea} />
    </div>
  );
}

export default HeatmapVis;
