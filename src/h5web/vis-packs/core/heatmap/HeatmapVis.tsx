import { ReactElement, useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import Mesh from './Mesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims, getPixelEdges } from './utils';
import { Domain, ScaleType, AxisParams } from '../models';
import type { ColorMap } from './models';
import { DEFAULT_DOMAIN, getDomain, getValueToIndexScale } from '../utils';
import { assertDefined } from '../../../guards';

interface Props {
  dataArray: ndarray;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  keepAspectRatio?: boolean;
  showGrid?: boolean;
  title?: string;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
}

function HeatmapVis(props: Props): ReactElement {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    keepAspectRatio = true,
    showGrid = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
  } = props;

  const { rows, cols } = getDims(dataArray);
  const aspectRatio = keepAspectRatio ? cols / rows : undefined; // width / height <=> cols / rows

  const abscissas = getPixelEdges(abscissaParams.value, cols);
  const abscissaToIndex = getValueToIndexScale(abscissas);
  const abscissaDomain = useMemo(() => getDomain(abscissas), [abscissas]);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = getPixelEdges(ordinateParams.value, rows);
  const ordinateToIndex = getValueToIndexScale(ordinates);
  const ordinateDomain = useMemo(() => getDomain(ordinates), [ordinates]);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  return (
    <figure className={styles.root} aria-labelledby="vis-title">
      <VisCanvas
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaParams.value,
          label: abscissaParams.label,
        }}
        ordinateConfig={{
          domain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinateParams.value,
          label: ordinateParams.label,
        }}
        aspectRatio={aspectRatio}
        canvasTitle={title}
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
        <Mesh
          rows={rows}
          cols={cols}
          values={dataArray.data as number[]}
          domain={domain}
          colorMap={colorMap}
          scaleType={scaleType}
        />
      </VisCanvas>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        withBounds
      />
    </figure>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
