import React from 'react';
import shallow from 'zustand/shallow';
import styles from './LineVis.module.css';
import DataLine from './DataLine';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useProps, useAxisDomains } from './hooks';
import LineProvider from './LineProvider';
import { useLineConfig } from './config';

function LineVis(): JSX.Element {
  const props = useProps();
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
          <PanZoomMesh />
          <DataLine />
        </LineProvider>
      </VisCanvas>
    </div>
  );
}

export default LineVis;
