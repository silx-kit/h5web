import type { ReactElement, ReactNode } from 'react';
import type { NdArray } from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { Domain, ScaleType, AxisParams } from '../models';
import type { ColorMap, Layout, TooltipData, VisScaleType } from './models';
import { DEFAULT_DOMAIN } from '../utils';
import { assertDefined } from '../../../guards';
import { useAxisValues } from './hooks';
import { useDomain, useValueToIndexScale } from '../hooks';
import HeatmapMesh from './HeatmapMesh';
import { formatTooltipVal } from '../../../utils';

interface Props {
  dataArray: NdArray<number[]>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: VisScaleType;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alphaArray?: NdArray<number[]>;
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
  const abscissaDomain = useDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = useAxisValues(ordinateValue, rows);
  const ordinateDomain = useDomain(ordinates);
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
                {`${abscissaLabel || 'x'}=${formatTooltipVal(abscissa)}, `}
                {`${ordinateLabel || 'y'}=${formatTooltipVal(ordinate)}`}
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
          alphaValues={alphaArray && alphaArray.data}
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
