import type { AnyArray, Domain } from '@h5web/shared';
import { assertDefined, formatTooltipVal, ScaleType } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import type { ReactElement, ReactNode } from 'react';

import { useAxisDomain, useValueToIndexScale } from '../hooks';
import type { VisScaleType, AxisParams } from '../models';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_DOMAIN } from '../utils';
import ColorBar from './ColorBar';
import HeatmapMesh from './HeatmapMesh';
import styles from './HeatmapVis.module.css';
import { useAxisValues } from './hooks';
import type { ColorMap, Layout, TooltipData } from './models';
import { getDims } from './utils';

interface Props {
  dataArray: NdArray<AnyArray<number>>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: VisScaleType;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alphaArray?: NdArray<AnyArray<number>>;
  alphaDomain?: Domain;
  flipYAxis?: boolean;
  renderTooltip?: (data: TooltipData) => ReactElement;
  children?: ReactNode;
}

function HeatmapVis(props: Props) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    layout = 'cover',
    showGrid = false,
    invertColorMap = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
    alphaArray,
    alphaDomain,
    flipYAxis,
    renderTooltip,
    children,
  } = props;

  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;

  const { rows, cols } = getDims(dataArray);

  const abscissas = useAxisValues(abscissaValue, cols);
  const abscissaDomain = useAxisDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = useAxisValues(ordinateValue, rows);
  const ordinateDomain = useAxisDomain(ordinates);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const abscissaToIndex = useValueToIndexScale(abscissas);
  const ordinateToIndex = useValueToIndexScale(ordinates);

  return (
    <figure
      className={styles.root}
      aria-labelledby="vis-title"
      data-keep-canvas-colors
    >
      <VisCanvas
        title={title}
        aspectRatio={layout === 'contain' ? cols / rows : undefined}
        visRatio={layout === 'cover' ? cols / rows : undefined}
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaValue,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinateValue,
          label: ordinateLabel,
          flip: flipYAxis,
        }}
      >
        <PanZoomMesh />
        <TooltipMesh
          guides="both"
          renderTooltip={(x, y) => {
            const xi = abscissaToIndex(x);
            const yi = ordinateToIndex(y);
            const abscissa = abscissas[xi];
            const ordinate = ordinates[yi];

            if (renderTooltip) {
              return renderTooltip({ abscissa, ordinate, xi, yi, x, y });
            }

            return (
              <>
                {`${abscissaLabel ?? 'x'}=${formatTooltipVal(abscissa)}, `}
                {`${ordinateLabel ?? 'y'}=${formatTooltipVal(ordinate)}`}
                <div className={styles.tooltipValue}>
                  {formatTooltipVal(dataArray.get(yi, xi))}
                </div>
              </>
            );
          }}
        />
        <HeatmapMesh
          rows={rows}
          cols={cols}
          values={dataArray.data}
          domain={domain}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          scaleType={scaleType}
          alphaValues={alphaArray?.data}
          alphaDomain={alphaDomain}
        />
        {children}
      </VisCanvas>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        withBounds
      />
    </figure>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
