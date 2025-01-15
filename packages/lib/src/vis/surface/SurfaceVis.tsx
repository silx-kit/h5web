import {
  type ColorScaleType,
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type PropsWithChildren } from 'react';

import ColorBar from '../heatmap/ColorBar';
import { type ColorMap } from '../heatmap/models';
import { type ClassStyleAttrs } from '../models';
import R3FCanvas from '../shared/R3FCanvas';
import SurfaceMesh from './SurfaceMesh';
import styles from './SurfaceVis.module.css';

interface Props extends ClassStyleAttrs {
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
    className = '',
    style,
  } = props;

  return (
    <figure
      className={`${styles.root} ${className}`}
      style={style}
      data-keep-canvas-colors
    >
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
