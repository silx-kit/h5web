import React, { ReactElement } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import type ndarray from 'ndarray';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useLineConfig } from './config';
import TooltipMesh from '../shared/TooltipMesh';
import { extendDomain } from '../shared/utils';
import { useAxisDomain } from './hooks';

interface Props {
  dataArray: ndarray<number>;
}

function LineVis(props: Props): ReactElement {
  const { dataArray } = props;

  const [showGrid, scaleType] = useLineConfig(
    (state) => [state.showGrid, state.scaleType],
    shallow
  );

  const dataDomain = useAxisDomain(dataArray, scaleType);

  if (!dataDomain) {
    return <></>;
  }

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          indexDomain: extendDomain([0, dataArray.size - 1], 0.01),
          showGrid,
        }}
        ordinateConfig={{
          dataDomain,
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
        <DataCurve values={dataArray.data as number[]} />
      </VisCanvas>
    </div>
  );
}

export default LineVis;
