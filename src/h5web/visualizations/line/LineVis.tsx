import React from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import styles from './LineVis.module.css';
import DataCurve from './DataCurve';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useProps, useAxisDomains } from './hooks';
import LineProvider from './LineProvider';
import { useLineConfig } from './config';
import TooltipMesh from '../shared/TooltipMesh';

function LineVis(): JSX.Element {
  const props = useProps();
  const { data } = props;
  const [showGrid, hasYLogScale] = useLineConfig(
    state => [state.showGrid, state.hasYLogScale],
    shallow
  );

  const axisDomains = useAxisDomains();

  return (
    <div className={styles.root}>
      <VisCanvas
        axisDomains={axisDomains}
        showGrid={showGrid}
        hasYLogScale={hasYLogScale}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <LineProvider {...props}>
          <TooltipMesh
            formatIndex={([x]) => `x=${Math.floor(x)}`}
            formatValue={([x]) =>
              data[Math.floor(x)]
                ? format('.3f')(data[Math.floor(x)])
                : undefined
            }
            guides="vertical"
          />
          <PanZoomMesh />
          <DataCurve />
        </LineProvider>
      </VisCanvas>
    </div>
  );
}

export default LineVis;
