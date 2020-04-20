import { Canvas } from 'react-three-fiber';
import React, { useEffect, useMemo } from 'react';
import Mesh from './Mesh';
import { computeTextureData } from './utils';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import ColorMapSelector from './ColorMapSelector';
import LogScaleToggler from './LogScaleToggler';
import { useHeatmapState, useHeatmapActions } from './store';
import AxisGrid from './AxisGrid';

const AXIS_OFFSETS: [number, number] = [72, 36];

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const { colorScale, dataScale } = useHeatmapState();
  const { findDomain } = useHeatmapActions();

  const values = useMemo(() => data.flat(), [data]);
  const textureData = useMemo(
    () => computeTextureData(values, colorScale, dataScale),
    [dataScale, colorScale, values]
  );

  useEffect(() => {
    findDomain(values);
  }, [findDomain, values]);

  return (
    <div className={styles.root}>
      <div className={styles.mapArea}>
        <Canvas className={styles.heatmap} orthographic invalidateFrameloop>
          <ambientLight />
          {textureData && (
            <Mesh
              dims={dims}
              textureData={textureData}
              axisOffsets={AXIS_OFFSETS}
            />
          )}
          <AxisGrid dims={dims} axisOffsets={AXIS_OFFSETS} />
        </Canvas>
      </div>
      <div className={styles.colorBarArea}>
        <LogScaleToggler />
        <ColorBar />
        <ColorMapSelector className={styles.bottomRightArea} />
      </div>
    </div>
  );
}

export default HeatmapVis;
