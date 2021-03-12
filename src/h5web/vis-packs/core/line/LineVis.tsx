import { ReactElement, useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import { range } from 'd3-array';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import { ScaleType, Domain, AxisParams } from '../models';
import { CurveType } from './models';
import {
  getValueToIndexScale,
  getDomain,
  extendDomain,
  DEFAULT_DOMAIN,
} from '../utils';
import { assertDefined } from '../../../guards';

interface Props {
  dataArray: ndarray;
  domain: Domain | undefined;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
  title?: string;
  errorsArray?: ndarray;
  showErrors?: boolean;
  auxArrays?: ndarray[];
}

function LineVis(props: Props): ReactElement {
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
    value: abscissas = range(dataArray.size),
    scaleType: abscissaScaleType,
  } = abscissaParams;

  if (abscissas.length !== dataArray.size) {
    throw new Error(
      `Abscissas size (${abscissas.length}) does not match data length (${dataArray.size})`
    );
  }

  if (errorsArray && errorsArray.size !== dataArray.size) {
    throw new Error(
      `Error size (${errorsArray.size}) does not match data length (${dataArray.size})`
    );
  }

  if (auxArrays.some((auxArray) => auxArray.size !== dataArray.size)) {
    throw new Error(
      `Auxiliary arrays size does not match data length (${dataArray.size})`
    );
  }

  const abscissaToIndex = getValueToIndexScale(abscissas, true);

  const abscissaDomain = useMemo(() => {
    const rawDomain = getDomain(abscissas, abscissaScaleType);
    return rawDomain && extendDomain(rawDomain, 0.01, abscissaScaleType);
  }, [abscissas, abscissaScaleType]);

  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const dataDomain = useMemo(() => {
    return domain ? extendDomain(domain, 0.05, scaleType) : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  return (
    <figure className={styles.root} aria-labelledby="vis-title">
      <VisCanvas
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          scaleType: abscissaScaleType,
          isIndexAxis: !abscissaParams.value,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          domain: dataDomain,
          showGrid,
          scaleType,
          label: ordinateLabel,
        }}
        canvasTitle={title}
      >
        <TooltipMesh
          formatIndex={([x]) =>
            `${abscissaLabel || 'x'}=${format('0')(
              abscissas[abscissaToIndex(x)]
            )}`
          }
          formatValue={([x]) => {
            const index = abscissaToIndex(x);
            const value = dataArray.get(index);

            if (value === undefined) {
              return undefined;
            }

            const error = errorsArray && errorsArray.get(index);
            return error
              ? `${format('.3f')(value)} ±${format('.3f')(error)}`
              : `${format('.3f')(value)}`;
          }}
          guides="vertical"
        />
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
