import { assertDefined, assertLength } from '@h5web/shared/guards';
import type { AxisScaleType, Domain, NumArray } from '@h5web/shared/vis-models';
import { ScaleType } from '@h5web/shared/vis-models';
import { formatTooltipErr, formatTooltipVal } from '@h5web/shared/vis-utils';
import type { NdArray } from 'ndarray';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import type { DefaultInteractionsConfig } from '../../interactions/DefaultInteractions';
import DefaultInteractions from '../../interactions/DefaultInteractions';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import { useAxisDomain, useCssColors, useValueToIndexScale } from '../hooks';
import type { AxisParams } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_DOMAIN, extendDomain } from '../utils';
import DataCurve from './DataCurve';
import { useAxisValues } from './hooks';
import styles from './LineVis.module.css';
import type { AuxiliaryParams, TooltipData } from './models';
import { CurveType } from './models';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain | undefined;
  scaleType?: AxisScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
  title?: string;
  dtype?: string;
  errorsArray?: NdArray<NumArray>;
  showErrors?: boolean;
  auxiliaries?: AuxiliaryParams[];
  renderTooltip?: (data: TooltipData) => ReactElement;
  children?: ReactNode;
  interactions?: DefaultInteractionsConfig;
  testid?: string;
  ignoreValue?: (val: number) => boolean;
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
    auxiliaries = [],
    renderTooltip,
    children,
    interactions,
    testid,
    ignoreValue,
  } = props;

  const {
    label: abscissaLabel,
    value: abscissaValue,
    scaleType: abscissaScaleType,
  } = abscissaParams;

  assertLength(errorsArray, dataArray.size, 'error');
  auxiliaries.forEach(({ label, array }, index) =>
    assertLength(array, dataArray.size, `'${label || index}' auxiliary`),
  );

  const abscissas = useAxisValues(abscissaValue, dataArray.size);
  const abscissaToIndex = useValueToIndexScale(abscissas, true);

  const abscissaDomain = useAxisDomain(abscissas, abscissaScaleType, 0.01);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const dataDomain = useMemo(() => {
    return domain ? extendDomain(domain, 0.05, scaleType) : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  const [[curveColor, auxColorList], rootRef] = useCssColors([
    '--curve-color',
    '--aux-colors',
  ]);
  const auxColors = auxColorList.split(',').map((col) => col.trim()); // support comma-separated list of colors

  return (
    <figure
      ref={rootRef}
      className={styles.root}
      aria-label={title}
      data-keep-canvas-colors
      data-testid={testid}
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
        <DefaultInteractions {...interactions} />
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
                {`${abscissaLabel ?? 'x'} = ${formatTooltipVal(abscissa)}`}

                <div className={styles.tooltipValue}>
                  {auxiliaries.length > 0 && (
                    <span
                      className={styles.mark}
                      data-keep-colors
                      style={{ color: curveColor }}
                    />
                  )}
                  <span>
                    <strong>{formatTooltipVal(value)}</strong>
                    {error !== undefined && ` ±${formatTooltipErr(error)}`}
                    {dtype && <em>{` (${dtype})`}</em>}
                  </span>
                </div>

                {auxiliaries.map(({ label, array, errors }, index) => (
                  <div className={styles.tooltipAux} key={label || index}>
                    <span
                      className={styles.mark}
                      data-keep-colors
                      style={{ color: auxColors[index % auxColors.length] }}
                    />
                    {label ? `${label} = ` : ''}
                    {formatTooltipVal(array.get(xi))}
                    {errors && ` ±${formatTooltipErr(errors.get(xi))}`}
                  </div>
                ))}
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
          ignoreValue={ignoreValue}
        />

        {auxiliaries.map(({ array, label, errors }, i) => (
          <DataCurve
            key={label}
            abscissas={abscissas}
            ordinates={array.data}
            errors={errors?.data}
            showErrors={showErrors}
            color={auxColors[i % auxColors.length]}
            curveType={curveType}
            ignoreValue={ignoreValue}
          />
        ))}

        {children}
      </VisCanvas>
    </figure>
  );
}

export type { Props as LineVisProps };
export default LineVis;
