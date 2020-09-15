import React, { useEffect } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims, useMemoColorScaleDomain } from './utils';

interface Props {
  dataArray: ndarray<number>;
}

function HeatmapVis(props: Props): JSX.Element {
  const { dataArray } = props;

  const { rows, cols } = getDims(dataArray);
  const values = dataArray.data as number[];

  const {
    dataDomain,
    customDomain,
    scaleType,
    colorMap,
    keepAspectRatio,
    showGrid,
    initDataDomain,
  } = useHeatmapConfig();

  // width / height <=> cols / rows
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  const domain = useMemoColorScaleDomain(
    scaleType,
    values,
    dataDomain,
    customDomain
  );

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
        <Mesh
          rows={rows}
          cols={cols}
          values={values}
          domain={domain}
          scaleType={scaleType}
          colorMap={colorMap}
        />
      </VisCanvas>
      <ColorBar domain={domain} scaleType={scaleType} colorMap={colorMap} />
    </div>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
