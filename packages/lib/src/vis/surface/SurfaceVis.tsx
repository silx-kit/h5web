import {
  type ColorScaleType,
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type PropsWithChildren } from 'react';

import ColorBar from '../heatmap/ColorBar';
import { useInterpolator } from '../heatmap/hooks';
import { type ColorMap, type D3Interpolator } from '../heatmap/models';
import { type ClassStyleAttrs } from '../models';
import R3FCanvas from '../shared/R3FCanvas';
import SurfaceMesh from './SurfaceMesh';
import styles from './SurfaceVis.module.css';

interface Props extends ClassStyleAttrs {
  dataArray: NdArray<NumArray>;
  domain: Domain;
  scaleType?: ColorScaleType;
  colorMap?: ColorMap | D3Interpolator;
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

  const interpolator = useInterpolator(colorMap, invertColorMap);

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
          interpolator={interpolator}
          scaleType={scaleType}
          showPoints={showPoints}
        />
        {children}
      </R3FCanvas>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        interpolator={interpolator}
        withBounds
      />
    </figure>
  );
}

export type { Props as SurfaceVisProps };
export default SurfaceVis;
