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
import { Domain } from '../shared/models';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const [mapAreaRef, heatmapStyles] = useHeatmapStyles();

  const { dims, axisOffsets, data } = props;
  const xDomain: Domain = [0, dims[1]];
  const yDomain: Domain = [0, dims[0]];

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
                  axisDomains={{ left: yDomain, bottom: xDomain }}
                  axisOffsets={axisOffsets}
                />
                <TooltipMesh dims={dims} data={data} />
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
