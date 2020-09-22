import React from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { useSupportedDomain } from './hooks';
import { Domain, ScaleType } from '../shared/models';
import type { ColorMap } from './models';

interface Props {
  dataArray: ndarray<number>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  keepAspectRatio?: boolean;
  showGrid?: boolean;
  showLoader?: boolean;
}

function HeatmapVis(props: Props): JSX.Element {
  const {
    dataArray,
    domain,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    keepAspectRatio = true,
    showGrid = false,
    showLoader = true,
  } = props;

  const values = dataArray.data as number[];
  const supportedDomain = useSupportedDomain(domain, scaleType, values);

  const { rows, cols } = getDims(dataArray);
  const aspectRatio = keepAspectRatio ? cols / rows : undefined; // width / height <=> cols / rows

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
        {supportedDomain && (
          <Mesh
            rows={rows}
            cols={cols}
            values={values}
            domain={supportedDomain}
            scaleType={scaleType}
            colorMap={colorMap}
            showLoader={showLoader}
          />
        )}
      </VisCanvas>
      {supportedDomain && (
        <ColorBar
          domain={supportedDomain}
          scaleType={scaleType}
          colorMap={colorMap}
        />
      )}
    </div>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
