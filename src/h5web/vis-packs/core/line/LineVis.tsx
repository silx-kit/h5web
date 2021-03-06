import { ReactNode, useMemo } from 'react';
import type { NdArray } from 'ndarray';
import { range } from 'd3-array';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import { ScaleType, Domain, AxisParams } from '../models';
import { CurveType } from './models';
import { getDomain, extendDomain, DEFAULT_DOMAIN } from '../utils';
import { assertDataLength, assertDefined } from '../../../guards';
import { useTooltipFormatters } from './hooks';
import { useCSSCustomProperties } from '../hooks';

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
    return abscissaValue || range(dataArray.size);
  }, [abscissaValue, dataArray.size]);

  const abscissaDomain = useMemo(() => {
    const rawDomain = getDomain(abscissas, abscissaScaleType);
    return rawDomain && extendDomain(rawDomain, 0.01, abscissaScaleType);
  }, [abscissas, abscissaScaleType]);

  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const dataDomain = useMemo(() => {
    return domain ? extendDomain(domain, 0.05, scaleType) : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  const tooltipFormatters = useTooltipFormatters(
    abscissas,
    abscissaLabel,
    dataArray,
    errorsArray
  );

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
        <TooltipMesh {...tooltipFormatters} guides="vertical" />
        <DataCurve
          abscissas={abscissas}
          ordinates={dataArray.data}
          errors={errorsArray && errorsArray.data}
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
