import type { Domain, NumArray, NumericType } from '@h5web/shared';
import {
  isTypedArray,
  assertLength,
  assertDefined,
  formatTooltipVal,
  formatTooltipErr,
  ScaleType,
} from '@h5web/shared';
import { range } from 'd3-array';
import type { NdArray } from 'ndarray';
import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';

import Pan from '../../interactions/Pan';
import ResetZoomButton from '../../interactions/ResetZoomButton';
import SelectToZoom from '../../interactions/SelectToZoom';
import XAxisZoom from '../../interactions/XAxisZoom';
import YAxisZoom from '../../interactions/YAxisZoom';
import Zoom from '../../interactions/Zoom';
import { useAxisDomain, useCustomColors, useValueToIndexScale } from '../hooks';
import type { AxisParams, CustomColor } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { extendDomain, DEFAULT_DOMAIN, formatNumType } from '../utils';
import DataCurve from './DataCurve';
import styles from './LineVis.module.css';
import type { TooltipData } from './models';
import { CurveType } from './models';

// Inspired by Matplotlib palette: https://matplotlib.org/stable/gallery/color/named_colors.html
const COLORS: CustomColor[] = [
  {
    property: '--h5w-line--color',
    fallback: 'darkblue',
    darkFallback: 'deepskyblue',
  },
  {
    property: '--h5w-line--colorAux',
    fallback: 'orangered, forestgreen, red, mediumorchid, olive',
    darkFallback: 'orange, lightgreen, red, violet, gold',
  },
];

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain | undefined;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
  title?: string;
  dtype?: NumericType;
  errorsArray?: NdArray<NumArray>;
  showErrors?: boolean;
  auxArrays?: NdArray<NumArray>[];
  renderTooltip?: (data: TooltipData) => ReactElement;
  children?: ReactNode;
}

function LineVis(props: Props) {
  const {
    dataArray,
    domain,
    curveType = CurveType.LineOnly,
    showGrid = true,
    scaleType = ScaleType.Linear,
    abscissaParams = {},
    ordinateLabel,
    title,
    dtype,
    errorsArray,
    showErrors = false,
    auxArrays = [],
    renderTooltip,
    children,
  } = props;

  const {
    label: abscissaLabel,
    value: abscissaValue,
    scaleType: abscissaScaleType,
  } = abscissaParams;

  assertLength(abscissaValue, dataArray.size, 'abscissa');
  assertLength(errorsArray, dataArray.size, 'error');
  auxArrays.forEach((arr) => assertLength(arr, dataArray.size, 'auxiliary'));

  const abscissas = useMemo(() => {
    if (!abscissaValue) {
      return range(dataArray.size);
    }

    return isTypedArray(abscissaValue) ? [...abscissaValue] : abscissaValue;
  }, [abscissaValue, dataArray.size]);

  const abscissaToIndex = useValueToIndexScale(abscissas, true);

  const abscissaDomain = useAxisDomain(abscissas, abscissaScaleType, 0.01);

  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const dataDomain = useMemo(() => {
    return domain ? extendDomain(domain, 0.05, scaleType) : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  const [[curveColor, auxColorList], rootRef] = useCustomColors(COLORS);
  const auxColors = auxColorList.split(',').map((col) => col.trim()); // support comma-separated list of colors

  return (
    <figure
      ref={rootRef}
      className={styles.root}
      aria-label={title}
      data-keep-canvas-colors
    >
      <VisCanvas
        title={title}
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          scaleType: abscissaScaleType,
          isIndexAxis: !abscissaValue,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          visDomain: dataDomain,
          showGrid,
          scaleType,
          label: ordinateLabel,
        }}
      >
        <Pan />
        <Zoom />
        <XAxisZoom />
        <YAxisZoom />
        <SelectToZoom />
        <ResetZoomButton />
        <TooltipMesh
          guides="vertical"
          renderTooltip={(x) => {
            const xi = abscissaToIndex(x);
            const abscissa = abscissas[xi];

            if (renderTooltip) {
              return renderTooltip({ abscissa, xi, x });
            }

            const value = dataArray.get(xi);
            const error = errorsArray?.get(xi);
            return (
              <>
                {`${abscissaLabel ?? 'x'}=${formatTooltipVal(abscissa)}`}
                <div className={styles.tooltipValue}>
                  <strong>{formatTooltipVal(value)}</strong>
                  {error && ` ±${formatTooltipErr(error)}`}
                  {dtype && <em>{` (${formatNumType(dtype)})`}</em>}
                </div>
              </>
            );
          }}
        />
        <DataCurve
          abscissas={abscissas}
          ordinates={dataArray.data}
          errors={errorsArray?.data}
          showErrors={showErrors}
          color={curveColor}
          curveType={curveType}
        />
        {auxArrays.map((array, i) => (
          <DataCurve
            key={i} // eslint-disable-line react/no-array-index-key
            abscissas={abscissas}
            ordinates={array.data}
            color={auxColors[i < auxColors.length ? i : auxColors.length - 1]}
            curveType={curveType}
          />
        ))}
        {children}
      </VisCanvas>
    </figure>
  );
}

export type { Props as LineVisProps };
export default LineVis;
