import React, { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useProps, useValues } from './hooks';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import HeatmapProvider from './HeatmapProvider';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';

function HeatmapVis(): JSX.Element {
  const props = useProps();
  const { dims, data } = props;
  const [rows, cols] = dims;

  const [keepAspectRatio, showGrid] = useHeatmapConfig(
    state => [state.keepAspectRatio, state.showGrid],
    shallow
  );

  // width / height <=> cols / rows
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

  const values = useValues();
  const initDataDomain = useHeatmapConfig(state => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        // -0.5 to have ticks at the center of pixels
        abscissaConfig={{ indexDomain: [-0.5, cols - 0.5], showGrid }}
        ordinateConfig={{ indexDomain: [-0.5, cols - 0.5], showGrid }}
        aspectRatio={aspectRatio}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <HeatmapProvider {...props}>
          <TooltipMesh
            formatIndex={([x, y]) =>
              `x=${Math.floor(x + 0.5)}, y=${Math.floor(y + 0.5)}`
            }
            formatValue={([x, y]) =>
              format('.3')(data[Math.floor(y + 0.5)][Math.floor(x + 0.5)])
            }
            guides="both"
          />
          <PanZoomMesh />
          <Mesh />
        </HeatmapProvider>
      </VisCanvas>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
