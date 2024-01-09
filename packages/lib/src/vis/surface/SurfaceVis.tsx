import type {
  ColorScaleType,
  Domain,
  NumArray,
} from '@h5web/shared/vis-models';
import { ScaleType } from '@h5web/shared/vis-models';
import type { NdArray } from 'ndarray';
import type { PropsWithChildren } from 'react';

import ColorBar from '../heatmap/ColorBar';
import type { ColorMap } from '../heatmap/models';
import R3FCanvas from '../shared/R3FCanvas';
import SurfaceMesh from './SurfaceMesh';
import styles from './SurfaceVis.module.css';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain;
  scaleType?: ColorScaleType;
  colorMap?: ColorMap;
  invertColorMap?: boolean;
  showPoints?: boolean;
}

function SurfaceVis(props: PropsWithChildren<Props>) {
  const {
    dataArray,
    domain,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    invertColorMap = false,
    showPoints = false,
    children,
  } = props;

  return (
    <figure className={styles.root} data-keep-canvas-colors>
      <R3FCanvas className={styles.canvas}>
        <SurfaceMesh
          dataArray={dataArray}
          domain={domain}
          colorMap={colorMap}
          scaleType={scaleType}
          invertColorMap={invertColorMap}
          showPoints={showPoints}
        />
        {children}
      </R3FCanvas>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        withBounds
      />
    </figure>
  );
}

export type { Props as SurfaceVisProps };
export default SurfaceVis;
