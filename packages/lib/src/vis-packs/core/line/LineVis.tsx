import type { Domain } from '@h5web/shared';
import {
  assertDataLength,
  assertDefined,
  formatTooltipVal,
  formatTooltipErr,
  ScaleType,
} from '@h5web/shared';
import { range } from 'd3-array';
import type { NdArray } from 'ndarray';
import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { useCSSCustomProperties, useValueToIndexScale } from '../hooks';
import type { AxisParams } from '../models';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDomain, extendDomain, DEFAULT_DOMAIN } from '../utils';
import DataCurve from './DataCurve';
import styles from './LineVis.module.css';
import type { TooltipData } from './models';
import { CurveType } from './models';

const DEFAULT_CURVE_COLOR = 'midnightblue';
const DEFAULT_AUX_COLORS =
  'orangered, forestgreen, crimson, mediumslateblue, sienna';

interface Props {
  dataArray: NdArray<number[]>;
  domain: Domain | undefined;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
  title?: string;
  errorsArray?: NdArray<number[]>;
  showErrors?: boolean;
  auxArrays?: NdArray<number[]>[];
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

  assertDataLength(abscissaValue, dataArray, 'abscissa');
  assertDataLength(errorsArray, dataArray, 'error');
  auxArrays.forEach((arr) => assertDataLength(arr, dataArray, 'auxiliary'));

  const abscissas = useMemo(() => {
    return abscissaValue ?? range(dataArray.size);
  }, [abscissaValue, dataArray.size]);

  const abscissaToIndex = useValueToIndexScale(abscissas, true);

  const abscissaDomain = useMemo(() => {
    const rawDomain = getDomain(abscissas, abscissaScaleType);
    return rawDomain && extendDomain(rawDomain, 0.01, abscissaScaleType);
  }, [abscissas, abscissaScaleType]);

  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const dataDomain = useMemo(() => {
    return domain ? extendDomain(domain, 0.05, scaleType) : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  const {
    colors: [curveColor, rawAuxColor],
    refCallback: rootRef,
  } = useCSSCustomProperties('--h5w-line--color', '--h5w-line--colorAux');

  // Support comma-separated list of auxiliary colors
  const auxColors = (rawAuxColor || DEFAULT_AUX_COLORS)
    .split(',')
    .map((col) => col.trim());

  return (
    <figure ref={rootRef} className={styles.root} aria-labelledby="vis-title">
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
        <PanZoomMesh />
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
          color={curveColor || DEFAULT_CURVE_COLOR}
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
