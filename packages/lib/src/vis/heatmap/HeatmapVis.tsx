import {
  assertDefined,
  type Domain,
  formatTooltipVal,
  getDims,
  type NumArray,
  type NumericType,
  ScaleType,
} from '@h5web/shared';
import { type NdArray } from 'ndarray';
import { type ReactElement, type ReactNode } from 'react';

import DefaultInteractions, {
  type DefaultInteractionsConfig,
} from '../../interactions/DefaultInteractions';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import { useAxisDomain, useValueToIndexScale } from '../hooks';
import { type Aspect, type AxisParams, type VisScaleType } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_DOMAIN, formatNumType } from '../utils';
import ColorBar from './ColorBar';
import HeatmapMesh from './HeatmapMesh';
import styles from './HeatmapVis.module.css';
import { useMask, usePixelEdgeValues, useTextureSafeNdArray } from './hooks';
import { type ColorMap, type TooltipData } from './models';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: VisScaleType;
  aspect?: Aspect;
  showGrid?: boolean;
  title?: string;
  dtype?: NumericType;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alpha?: { array: NdArray<NumArray>; domain: Domain };
  flipYAxis?: boolean;
  renderTooltip?: (data: TooltipData) => ReactElement;
  children?: ReactNode;
  interactions?: DefaultInteractionsConfig;
  ignoreValue?: (v: number) => boolean;
}

function HeatmapVis(props: Props) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    aspect = 'equal',
    showGrid = false,
    invertColorMap = false,
    title,
    dtype,
    abscissaParams = {},
    ordinateParams = {},
    alpha,
    flipYAxis,
    renderTooltip,
    children,
    interactions,
    ignoreValue,
  } = props;
  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;
  const { rows, cols } = getDims(dataArray);

  const abscissas = usePixelEdgeValues(abscissaValue, cols);
  const abscissaDomain = useAxisDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = usePixelEdgeValues(ordinateValue, rows);
  const ordinateDomain = useAxisDomain(ordinates);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const abscissaToIndex = useValueToIndexScale(abscissas);
  const ordinateToIndex = useValueToIndexScale(ordinates);

  const safeDataArray = useTextureSafeNdArray(dataArray);
  const safeAlphaArray = useTextureSafeNdArray(alpha?.array);
  const maskArray = useMask(dataArray, ignoreValue);

  return (
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
      <VisCanvas
        title={title}
        aspect={aspect}
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
        <DefaultInteractions {...interactions} />
        <ResetZoomButton />

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
                  <strong>{formatTooltipVal(dataArray.get(yi, xi))}</strong>
                  {dtype && <em>{` (${formatNumType(dtype)})`}</em>}
                  {alpha && ` (${formatTooltipVal(alpha.array.get(yi, xi))})`}
                </div>
              </>
            );
          }}
        />

        <HeatmapMesh
          values={safeDataArray}
          domain={domain}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          scaleType={scaleType}
          alphaValues={safeAlphaArray}
          alphaDomain={alpha?.domain}
          scale={[1, flipYAxis ? -1 : 1, 1]}
          mask={maskArray}
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

export { type Props as HeatmapVisProps };
export default HeatmapVis;
