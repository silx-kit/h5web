import React from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useDataDomain, useData } from './hooks';
import { useLineConfig } from './config';
import TooltipMesh from '../shared/TooltipMesh';
import { extendDomain } from '../shared/utils';

function LineVis(): JSX.Element {
  const data = useData();

  const [showGrid, hasYLogScale] = useLineConfig(
    (state) => [state.showGrid, state.hasYLogScale],
    shallow
  );

  const dataDomain = useDataDomain();
  if (!dataDomain) {
    return <></>;
  }

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          indexDomain: extendDomain([0, data.length - 1], 0.01),
          showGrid,
        }}
        ordinateConfig={{
          dataDomain: extendDomain(dataDomain, 0.01),
          showGrid,
          isLog: hasYLogScale,
        }}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <TooltipMesh
          formatIndex={([x]) => `x=${Math.round(x)}`}
          formatValue={([x]) => {
            const value = data[Math.round(x)];
            return value !== undefined ? format('.3f')(value) : undefined;
          }}
          guides="vertical"
        />
        <PanZoomMesh />
        <DataCurve />
      </VisCanvas>
    </div>
  );
}

export default LineVis;
