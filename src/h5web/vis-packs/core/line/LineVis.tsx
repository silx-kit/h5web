import { useMemo } from 'react';
import type ndarray from 'ndarray';
import { range } from 'd3-array';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import { ScaleType, Domain, AxisParams } from '../models';
import { CurveType } from './models';
import { getDomain, extendDomain, DEFAULT_DOMAIN } from '../utils';
import {
  assertDataLength,
  assertDefined,
  assertNumericArray,
} from '../../../guards';
import { useTooltipFormatters } from './hooks';
import type { NumberOrNaN } from '../../../providers/models';

interface Props {
  dataArray: ndarray<NumberOrNaN>;
  domain: Domain | undefined;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
  title?: string;
  errorsArray?: ndarray<NumberOrNaN>;
  showErrors?: boolean;
  auxArrays?: ndarray<NumberOrNaN>[];
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
    showErrors,
    auxArrays = [],
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
  assertNumericArray(abscissas);

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

  return (
    <figure className={styles.root} aria-labelledby="vis-title">
      <VisCanvas
        canvasTitle={title}
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          scaleType: abscissaScaleType,
          isIndexAxis: !abscissaValue,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          domain: dataDomain,
          showGrid,
          scaleType,
          label: ordinateLabel,
        }}
      >
        <TooltipMesh {...tooltipFormatters} guides="vertical" />
        <PanZoomMesh />
        <DataCurve
          curveType={curveType}
          abscissas={abscissas}
          ordinates={dataArray.data as number[]}
          errors={errorsArray && (errorsArray.data as number[])}
          showErrors={showErrors}
        />
        {auxArrays.map((array, i) => (
          <DataCurve
            key={i} // eslint-disable-line react/no-array-index-key
            color="--secondary"
            curveType={curveType}
            abscissas={abscissas}
            ordinates={array.data as number[]}
          />
        ))}
      </VisCanvas>
    </figure>
  );
}

export type { Props as LineVisProps };
export default LineVis;
