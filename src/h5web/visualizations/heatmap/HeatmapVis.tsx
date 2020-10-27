import React, { useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims, getPixelEdges } from './utils';
import { Domain, ScaleType, AxisParams } from '../shared/models';
import type { ColorMap } from './models';
import { getDomain, getValueToIndexScale } from '../shared/utils';

interface Props {
  dataArray: ndarray<number>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  keepAspectRatio?: boolean;
  showGrid?: boolean;
  showLoader?: boolean;
  dataLabel?: string;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
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
    dataLabel,
    abscissaParams = {},
    ordinateParams = {},
  } = props;

  const { rows, cols } = getDims(dataArray);
  const aspectRatio = keepAspectRatio ? cols / rows : undefined; // width / height <=> cols / rows

  const abscissas = getPixelEdges(abscissaParams.values, cols);
  const ordinates = getPixelEdges(ordinateParams.values, rows);

  const abscissaToIndex = getValueToIndexScale(abscissas);

  const abscissaDomain = useMemo(() => {
    return getDomain(abscissas);
  }, [abscissas]);
  if (abscissaDomain === undefined) {
    throw new Error(`Abscissas (${abscissas}) have an empty domain`);
  }

  const ordinateToIndex = getValueToIndexScale(ordinates);

  const ordinateDomain = useMemo(() => {
    return getDomain(ordinates);
  }, [ordinates]);
  if (ordinateDomain === undefined) {
    throw new Error(`Ordinates (${ordinates}) have an empty domain`);
  }

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaParams.values,
          label: abscissaParams.label,
        }}
        ordinateConfig={{
          domain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinateParams.values,
          label: ordinateParams.label,
        }}
        aspectRatio={aspectRatio}
        canvasTitle={dataLabel}
      >
        <TooltipMesh
          formatIndex={([x, y]) => {
            return `${abscissaParams.label || 'x'}=${
              abscissas[abscissaToIndex(x)]
            }, ${ordinateParams.label || 'y'}=${ordinates[ordinateToIndex(y)]}`;
          }}
          formatValue={([x, y]) => {
            return format('.3')(
              dataArray.get(ordinateToIndex(y), abscissaToIndex(x))
            );
          }}
          guides="both"
        />
        <PanZoomMesh />
        {domain && (
          <Mesh
            rows={rows}
            cols={cols}
            values={dataArray.data as number[]}
            domain={domain}
            scaleType={scaleType}
            colorMap={colorMap}
            showLoader={showLoader}
          />
        )}
      </VisCanvas>
      {domain && (
        <ColorBar domain={domain} scaleType={scaleType} colorMap={colorMap} />
      )}
    </div>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
