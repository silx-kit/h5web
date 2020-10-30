import React, { ReactElement, useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import { range } from 'd3-array';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import { ScaleType, Domain, AxisParams } from '../shared/models';
import { CurveType } from './models';
import { getValueToIndexScale, getDomain, extendDomain } from '../shared/utils';

const DEFAULT_DOMAIN: Domain = [0.1, 1];

interface Props {
  dataArray: ndarray;
  domain?: Domain;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
  abscissaParams?: AxisParams;
  ordinateLabel?: string;
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
  } = props;

  const {
    label: abscissaLabel,
    values: abscissas = range(dataArray.size),
  } = abscissaParams;

  if (abscissas.length !== dataArray.size) {
    throw new Error(
      `Abscissas size (${abscissas.length}) does not match data length (${dataArray.size})`
    );
  }

  const abscissaToIndex = getValueToIndexScale(abscissas, true);

  const abscissaDomain = useMemo(() => {
    const rawDomain = getDomain(abscissas);
    return rawDomain && extendDomain(rawDomain, 0.01);
  }, [abscissas]);

  if (!abscissaDomain) {
    throw new Error(`Abscissas have undefined domain`);
  }

  const dataDomain = useMemo(() => {
    return domain
      ? extendDomain(domain, 0.05, scaleType === ScaleType.Log)
      : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaParams.values,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          domain: dataDomain,
          showGrid,
          scaleType,
          label: ordinateLabel,
        }}
      >
        <TooltipMesh
          formatIndex={([x]) =>
            `${abscissaLabel || 'x'}=${format('0')(
              abscissas[abscissaToIndex(x)]
            )}`
          }
          formatValue={([x]) => {
            const value = dataArray.get(abscissaToIndex(x));
            return value !== undefined ? format('.3f')(value) : undefined;
          }}
          guides="vertical"
        />
        <PanZoomMesh />
        <DataCurve
          curveType={curveType}
          abscissas={abscissas}
          ordinates={dataArray.data as number[]}
        />
      </VisCanvas>
    </div>
  );
}

export type { Props as LineVisProps };
export default LineVis;
