import { Canvas } from 'react-three-fiber';
import React, { useEffect, useMemo } from 'react';
import Mesh from './Mesh';
import { computeTextureData } from './utils';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import {
  useHeatmapStore,
  dataScaleSelector,
  colorScaleSelector,
} from './store';
import AxisGrid from './AxisGrid';
import { useHeatmapSize } from './hooks';

const AXIS_OFFSETS: [number, number] = [72, 36];

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const findDomain = useHeatmapStore(state => state.findDomain);
  const colorScale = useHeatmapStore(colorScaleSelector);
  const dataScale = useHeatmapStore(dataScaleSelector);

  const [mapAreaRef, heatmapSize] = useHeatmapSize(dims, AXIS_OFFSETS);

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
      <div ref={mapAreaRef} className={styles.mapArea}>
        {heatmapSize && (
          <div className={styles.heatmap} style={heatmapSize}>
            <Canvas orthographic invalidateFrameloop>
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
        )}
      </div>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
