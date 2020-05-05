import React, { useEffect } from 'react';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useProps, useValues } from './hooks';
import Mesh from './Mesh';
import TooltipMesh from './TooltipMesh';
import HeatmapProvider from './HeatmapProvider';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const { dims, axisOffsets, data } = props;
  const [rows, cols] = dims;

  const keepAspectRatio = useHeatmapConfig(state => state.keepAspectRatio);
  const aspectRatio = keepAspectRatio ? rows / cols : undefined;

  const values = useValues();
  const initDataDomain = useHeatmapConfig(state => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        // -0.5 to have ticks at the center of pixels
        axisDomains={{ left: [-0.5, rows - 0.5], bottom: [-0.5, cols - 0.5] }}
        axisOffsets={axisOffsets}
        aspectRatio={aspectRatio}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <HeatmapProvider {...props}>
          <TooltipMesh dims={dims} data={data} />
          <PanZoomMesh />
          <Mesh />
        </HeatmapProvider>
      </VisCanvas>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
