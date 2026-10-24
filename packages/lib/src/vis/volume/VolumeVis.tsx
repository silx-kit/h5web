import {
  type ColorScaleType,
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { BoxGeometry, EdgesGeometry } from 'three';

import ColorBar from '../heatmap/ColorBar';
import { type ColorMap } from '../heatmap/models';
import { type ClassStyleAttrs } from '../models';
import R3FCanvas from '../shared/R3FCanvas';
import { VolumeQuality, VolumeRenderMode } from './models';
import { getBoxSize } from './utils';
import VolumeControls from './VolumeControls';
import VolumeMesh from './VolumeMesh';
import styles from './VolumeVis.module.css';

interface Props extends ClassStyleAttrs {
  dataArray: NdArray<NumArray>;
  domain: Domain;
  scaleType?: ColorScaleType;
  colorMap?: ColorMap;
  invertColorMap?: boolean;
  mode?: VolumeRenderMode;
  opacity?: number;
  threshold?: number;
  quality?: VolumeQuality;
  showBox?: boolean;
  background?: string;
}

function VolumeVis(props: PropsWithChildren<Props>) {
  const {
    dataArray,
    domain,
    colorMap = 'Inferno',
    scaleType = ScaleType.Linear,
    invertColorMap = false,
    mode = VolumeRenderMode.DVR,
    opacity = 0.25,
    threshold = 0.1,
    quality = VolumeQuality.Medium,
    showBox = true,
    background = '#10131a',
    children,
    className = '',
    style,
  } = props;

  if (dataArray.shape.length !== 3) {
    throw new Error('Expected three-dimensional array');
  }

  const interactingRef = useRef(false);
  const edges = useMemo(() => {
    const box = new BoxGeometry();
    const geometry = new EdgesGeometry(box);
    box.dispose();
    return geometry;
  }, []);
  useEffect(() => () => edges.dispose(), [edges]);

  return (
    <figure
      className={`${styles.root} ${className}`}
      style={style}
      data-keep-canvas-colors
    >
      <R3FCanvas className={styles.canvas}>
        <color attach="background" args={[background]} />
        <VolumeControls interactingRef={interactingRef} />
        <VolumeMesh
          dataArray={dataArray}
          domain={domain}
          scaleType={scaleType}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          mode={mode}
          opacity={opacity}
          threshold={threshold}
          quality={quality}
          interactingRef={interactingRef}
        />
        <lineSegments
          geometry={edges}
          scale={getBoxSize(dataArray.shape)}
          visible={showBox}
          renderOrder={1}
        >
          <lineBasicMaterial
            color="white"
            transparent
            opacity={0.2}
            depthTest={false}
          />
        </lineSegments>
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

export type { Props as VolumeVisProps };
export default VolumeVis;
