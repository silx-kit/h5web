import React, { useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import { range } from 'd3-array';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { Domain, ScaleType } from '../shared/models';
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
  abscissas?: number[];
  ordinates?: number[];
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

  const { rows, cols } = getDims(dataArray);
  const aspectRatio = keepAspectRatio ? cols / rows : undefined; // width / height <=> cols / rows

  const { abscissas = range(cols + 1), ordinates = range(rows + 1) } = props;

  if (abscissas.length !== cols + 1) {
    throw new Error(
      `Abscissas size (${
        abscissas.length
      }) does not match data length along X (${cols + 1})`
    );
  }
  if (ordinates.length !== rows + 1) {
    throw new Error(
      `Ordinate size (${
        ordinates.length
      }) does not match data length along Y (${rows + 1})`
    );
  }

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
          isIndexAxis: !abscissas,
        }}
        ordinateConfig={{
          domain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinates,
        }}
        aspectRatio={aspectRatio}
      >
        <TooltipMesh
          formatIndex={([x, y]) => {
            return `x=${abscissas[abscissaToIndex(x)]}, y=${
              ordinates[ordinateToIndex(y)]
            }`;
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
