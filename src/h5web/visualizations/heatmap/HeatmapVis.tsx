import { Canvas } from 'react-three-fiber';
import React, { useEffect, useMemo } from 'react';
import { computeTextureData } from './utils';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useHeatmapStore, selectDataScale, selectColorScale } from './store';
import { useHeatmapStyles } from './hooks';
import AxisGrid from './AxisGrid';
import Mesh from './Mesh';
import Tooltip from './Tooltip';

const AXIS_OFFSETS: [number, number] = [72, 36];

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const findDataDomain = useHeatmapStore(state => state.findDataDomain);
  const colorScale = useHeatmapStore(selectColorScale);
  const dataScale = useHeatmapStore(selectDataScale);

  const [mapAreaRef, heatmapStyles] = useHeatmapStyles(dims, AXIS_OFFSETS);

  const values = useMemo(() => data.flat(), [data]);
  const textureData = useMemo(
    () => computeTextureData(values, colorScale, dataScale),
    [dataScale, colorScale, values]
  );

  useEffect(() => {
    findDataDomain(values);
  }, [findDataDomain, values]);

  return (
    <div className={styles.root}>
      <div ref={mapAreaRef} className={styles.mapArea}>
        {heatmapStyles && (
          <div className={styles.heatmap} style={heatmapStyles}>
            <Canvas
              className={styles.canvasWrapper}
              orthographic
              invalidateFrameloop
            >
              <ambientLight />
              <AxisGrid dims={dims} axisOffsets={AXIS_OFFSETS} />
              <Tooltip dims={dims} data={data} />
              {textureData && <Mesh dims={dims} textureData={textureData} />}
            </Canvas>
          </div>
        )}
      </div>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
