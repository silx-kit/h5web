import { Canvas } from 'react-three-fiber';
import React, { useEffect } from 'react';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useHeatmapStyles, useProps, useValues } from './hooks';
import AxisGrid from '../shared/AxisGrid';
import Mesh from './Mesh';
import TooltipMesh from './TooltipMesh';
import HeatmapProvider from './HeatmapProvider';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const [mapAreaRef, heatmapStyles] = useHeatmapStyles();

  const { dims, axisOffsets, data } = props;
  const [rows, cols] = dims;

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
                <AxisGrid
                  // -0.5 to have ticks at the center of pixels
                  abscissaDomain={[-0.5, cols - 0.5]}
                  ordinateDomain={[-0.5, rows - 0.5]}
                  axisOffsets={axisOffsets}
                />
                <TooltipMesh dims={dims} data={data} />
                <PanZoomMesh />
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
