import React, { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';

interface Props {
  dataArray: ndarray<number>;
}

function HeatmapVis(props: Props): JSX.Element {
  const { dataArray } = props;

  const { rows, cols } = getDims(dataArray);
  const values = dataArray.data as number[];

  const [keepAspectRatio, showGrid] = useHeatmapConfig(
    (state) => [state.keepAspectRatio, state.showGrid],
    shallow
  );

  // width / height <=> cols / rows
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

  const initDataDomain = useHeatmapConfig((state) => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{ indexDomain: [0, cols], showGrid }}
        ordinateConfig={{ indexDomain: [0, rows], showGrid }}
        aspectRatio={aspectRatio}
      >
        <TooltipMesh
          formatIndex={([x, y]) => `x=${Math.floor(x)}, y=${Math.floor(y)}`}
          formatValue={([x, y]) => {
            return x < cols && y < rows
              ? format('.3')(dataArray.get(Math.floor(y), Math.floor(x)))
              : undefined;
          }}
          guides="both"
        />
        <PanZoomMesh />
        <Mesh rows={rows} cols={cols} values={values} />
      </VisCanvas>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
