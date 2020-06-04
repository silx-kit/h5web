import React, { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useValues, useData, useDims } from './hooks';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';

function HeatmapVis(): JSX.Element {
  const data = useData();
  const dims = useDims();
  const [rows, cols] = dims;

  const [keepAspectRatio, showGrid] = useHeatmapConfig(
    (state) => [state.keepAspectRatio, state.showGrid],
    shallow
  );

  // width / height <=> cols / rows
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

  const values = useValues();
  const initDataDomain = useHeatmapConfig((state) => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        // -0.5 to have ticks at the center of pixels
        abscissaConfig={{ indexDomain: [0, cols], showGrid }}
        ordinateConfig={{ indexDomain: [0, rows], showGrid }}
        aspectRatio={aspectRatio}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <TooltipMesh
          formatIndex={([x, y]) => `x=${Math.floor(x)}, y=${Math.floor(y)}`}
          formatValue={([x, y]) => {
            return x < cols && y < rows
              ? format('.3')(data[Math.floor(y)][Math.floor(x)])
              : undefined;
          }}
          guides="both"
        />
        <PanZoomMesh />
        <Mesh />
      </VisCanvas>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
