import React from 'react';
import styles from './LineVis.module.css';
import DataLine from './DataLine';
import VisCanvas from '../shared/VisCanvas';
import PanZoomMesh from '../shared/PanZoomMesh';
import { useProps, useAxisDomains } from './hooks';
import LineVisProvider from './LineVisProvider';
import { useLineVisConfig } from './config';

function LineVis(): JSX.Element {
  const props = useProps();
  const { axisOffsets } = props;
  const showGrid = useLineVisConfig(state => state.showGrid);

  const axisDomains = useAxisDomains();

  return (
    <div className={styles.root}>
      <VisCanvas
        axisOffsets={axisOffsets}
        axisDomains={axisDomains}
        showGrid={showGrid}
      >
        {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
        <LineVisProvider {...props}>
          <PanZoomMesh />
          <DataLine />
        </LineVisProvider>
      </VisCanvas>
    </div>
  );
}

export default LineVis;
