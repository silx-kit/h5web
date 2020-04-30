import { Canvas } from 'react-three-fiber';
import React, { useEffect } from 'react';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useHeatmapStyles, useProps, useValues } from './hooks';
import AxisGrid from './AxisGrid';
import Mesh from './Mesh';
import Tooltip from './Tooltip';
import HeatmapProvider from './HeatmapProvider';
import { useHeatmapConfig } from './config';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const [mapAreaRef, heatmapStyles] = useHeatmapStyles();

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
                <AxisGrid {...props} />
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
