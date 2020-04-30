import { Canvas } from 'react-three-fiber';
import React, { useEffect } from 'react';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useHeatmapStyles, useProps, useValues } from './hooks';
import AxisGrid from '../shared/AxisGrid';
import Mesh from './Mesh';
import Tooltip from './Tooltip';
import HeatmapProvider from './HeatmapProvider';
import { useHeatmapConfig } from './config';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const [mapAreaRef, heatmapStyles] = useHeatmapStyles();

  const { dims, axisOffsets } = props;
  const axisDomains = {
    left: [0, dims[0]] as [number, number],
    bottom: [0, dims[1]] as [number, number],
  };

  const values = useValues();
  const initDataDomain = useHeatmapConfig(state => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

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
              {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
              <HeatmapProvider {...props}>
                <AxisGrid axisDomains={axisDomains} axisOffsets={axisOffsets} />
                <Tooltip />
                <Mesh />
              </HeatmapProvider>
            </Canvas>
          </div>
        )}
      </div>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
