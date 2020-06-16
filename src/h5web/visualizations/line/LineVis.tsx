import React, { ReactElement, useMemo } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useLineConfig } from './config';
import TooltipMesh from '../shared/TooltipMesh';
import { extendDomain, findDomain } from '../shared/utils';
import { ScaleType } from '../shared/models';

interface Props {
  dataArray: ndarray<number>;
}

function LineVis(props: Props): ReactElement {
  const { dataArray } = props;

  const [showGrid, scaleType] = useLineConfig(
    (state) => [state.showGrid, state.scaleType],
    shallow
  );

  const values = dataArray.data as number[];
  const dataDomain = useMemo(() => {
    const isLogScale = scaleType === ScaleType.Log;
    const rawDomain = findDomain(
      isLogScale ? values.filter((x) => x > 0) : values
    );

    return rawDomain && extendDomain(rawDomain, 0.05, isLogScale);
  }, [scaleType, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          indexDomain: extendDomain([0, dataArray.size - 1], 0.01),
          showGrid,
        }}
        ordinateConfig={{
          dataDomain: dataDomain || [0.1, 1],
          showGrid,
          scaleType,
        }}
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
        {dataDomain && <DataCurve values={dataArray.data as number[]} />}
      </VisCanvas>
    </div>
  );
}

export default LineVis;
