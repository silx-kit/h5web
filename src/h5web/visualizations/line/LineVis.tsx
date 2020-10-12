import React, { ReactElement, useMemo } from 'react';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import TooltipMesh from '../shared/TooltipMesh';
import { extendDomain } from '../shared/utils';
import { ScaleType, Domain } from '../shared/models';
import { CurveType } from './models';

const DEFAULT_DOMAIN: Domain = [0.1, 1];

interface Props {
  dataArray: ndarray<number>;
  domain: Domain | undefined;
  scaleType?: ScaleType;
  curveType?: CurveType;
  showGrid?: boolean;
}

function LineVis(props: Props): ReactElement {
  const {
    dataArray,
    domain,
    curveType = CurveType.LineOnly,
    showGrid = true,
    scaleType = ScaleType.Linear,
  } = props;

  const indexDomain = extendDomain([0, dataArray.size - 1], 0.01);
  const dataDomain = useMemo(() => {
    return domain
      ? extendDomain(domain, 0.05, scaleType === ScaleType.Log)
      : DEFAULT_DOMAIN;
  }, [scaleType, domain]);

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{ indexDomain, showGrid }}
        ordinateConfig={{ dataDomain, showGrid, scaleType }}
      >
        <TooltipMesh
          formatIndex={([x]) => `x=${Math.round(x)}`}
          formatValue={([x]) => {
            const value = dataArray.get(Math.round(x));
            return value !== undefined ? format('.3f')(value) : undefined;
          }}
          guides="vertical"
        />
        <PanZoomMesh />
        {dataDomain && (
          <DataCurve
            curveType={curveType}
            values={dataArray.data as number[]}
          />
        )}
      </VisCanvas>
    </div>
  );
}

export type { Props as LineVisProps };
export default LineVis;
