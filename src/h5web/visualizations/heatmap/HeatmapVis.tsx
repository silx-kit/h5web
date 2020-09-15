import React, { useMemo, useEffect } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import { usePrevious } from 'react-use';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { findDomain } from '../shared/utils';
import { useMemoColorScaleDomain } from './hooks';

interface Props {
  dataArray: ndarray<number>;
}

function HeatmapVis(props: Props): JSX.Element {
  const { dataArray } = props;

  const { rows, cols } = getDims(dataArray);
  const values = dataArray.data as number[];

  const {
    requestedDomain,
    scaleType,
    colorMap,
    keepAspectRatio,
    showGrid,
    resetDomains,
  } = useHeatmapConfig();

  const dataDomain = useMemo(() => findDomain(values), [values]);
  const prevDataDomain = usePrevious(dataDomain);

  // If `dataDomain` just changed, use `undefined` custom domain for this render until config's `requestedDomain` is updated through `useEffect` below
  const customDomain =
    dataDomain !== prevDataDomain ? undefined : requestedDomain;

  useEffect(() => {
    // When `dataDomain` changes:
    // - set data domain in config so toolbar can render domain slider with correct bounds;
    // - reset requested domain in config so toolbar can reset value of domain slider, and so Heatmap can use in its next render.
    resetDomains(dataDomain);
  }, [dataDomain, resetDomains]);

  const domain = useMemoColorScaleDomain(
    scaleType,
    values,
    dataDomain,
    customDomain
  );

  // width / height <=> cols / rows
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

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
