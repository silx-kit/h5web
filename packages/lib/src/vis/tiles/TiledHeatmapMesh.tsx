import { useThree } from '@react-three/fiber';
import { clamp, range } from 'lodash';
import { useRef } from 'react';
import type { Group } from 'three';

import { getInterpolator } from '../heatmap/utils';
import { useCameraState } from '../hooks';
import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import TiledLayer from './TiledLayer';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';
import { getScaledVisibleBox } from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  displayLowerResolutions?: boolean;
  qualityFactor?: number;
  size?: Size;
}

function TiledHeatmapMesh(props: Props) {
  const {
    api,
    displayLowerResolutions = true,
    qualityFactor = 1, // 0: Lower quality, less fetch; 1: Best quality
    size,
    ...colorMapProps
  } = props;
  const { baseLayerIndex, baseLayerSize } = api;

  const canvasSize = useThree((state) => state.size);
  const { visSize } = useAxisSystemContext();
  const meshSize = size ?? visSize;

  const groupRef = useRef<Group>(null);

  const box = useCameraState(
    (...args) =>
      getScaledVisibleBox(...args, meshSize, baseLayerSize, groupRef),
    [meshSize, baseLayerSize, groupRef]
  );

  let layers: number[] = [];
  if (box) {
    const itemsPerPixel = Math.max(
      1,
      Math.abs(box.max.x - box.min.x) / canvasSize.width,
      Math.abs(box.max.y - box.min.y) / canvasSize.height
    );

    const roundingOffset = 1 - clamp(qualityFactor, 0, 1);
    const subsamplingLevel = Math.min(
      Math.floor(Math.log2(itemsPerPixel) + roundingOffset),
      baseLayerIndex
    );
    const currentLayerIndex = baseLayerIndex - subsamplingLevel;

    // displayLowerResolutions selects which levels of detail layers are displayed:
    // true: lower resolution layers displayed behind the current one
    // false: only current level of detail layer is displayed
    layers = displayLowerResolutions
      ? range(currentLayerIndex + 1)
      : [currentLayerIndex];
  }

  const { colorMap, invertColorMap = false } = colorMapProps;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[meshSize.width, meshSize.height]} />
        <meshBasicMaterial
          color={getInterpolator(colorMap, invertColorMap)(0)}
        />
      </mesh>
      {layers.map((layer) => (
        <TiledLayer
          key={layer}
          api={api}
          layer={layer}
          size={meshSize}
          {...colorMapProps}
        />
      ))}
    </group>
  );
}

export type { Props as TiledHeatmapMeshProps };
export default TiledHeatmapMesh;
