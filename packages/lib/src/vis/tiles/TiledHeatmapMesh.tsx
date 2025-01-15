import { range } from 'd3-array';
import { useRef } from 'react';
import { type Group, MathUtils } from 'three';

import { useCameraState } from '../hooks';
import { type Size } from '../models';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { type TilesApi } from './api';
import { useTooltipOnMoveHandler } from './hooks';
import { type ColorMapProps } from './models';
import TiledLayer from './TiledLayer';
import {
  getNdcToObject3DMatrix,
  getObject3DPixelSize,
  getObject3DVisibleBox,
  scaleBoxToLayer,
} from './utils';

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

  const { canvasSize, visSize } = useVisCanvasContext();
  const meshSize = size ?? visSize;

  const groupRef = useRef<Group>(null);

  const ndcToLocalMatrix = useCameraState((camera) => {
    return getNdcToObject3DMatrix(camera, groupRef);
  }, []);
  const visibleBox = getObject3DVisibleBox(ndcToLocalMatrix);

  const bounds = scaleBoxToLayer(visibleBox, baseLayerSize, meshSize);

  let layers: number[] = [];
  if (!bounds.isEmpty()) {
    const pixelSize = getObject3DPixelSize(ndcToLocalMatrix, canvasSize);
    const dataPointsPerPixel = Math.max(
      1,
      (pixelSize.x / meshSize.width) * baseLayerSize.width,
      (pixelSize.y / meshSize.height) * baseLayerSize.height,
    );

    const roundingOffset = 1 - MathUtils.clamp(qualityFactor, 0, 1);
    const subsamplingLevel = Math.min(
      Math.floor(Math.log2(dataPointsPerPixel) + roundingOffset),
      baseLayerIndex,
    );
    const currentLayerIndex = baseLayerIndex - subsamplingLevel;

    // displayLowerResolutions selects which levels of detail layers are displayed:
    // true: lower resolution layers displayed behind the current one
    // false: only current level of detail layer is displayed
    layers = displayLowerResolutions
      ? range(currentLayerIndex + 1)
      : [currentLayerIndex];
  }

  const onPointerMove = useTooltipOnMoveHandler();

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <TiledLayer
          key={layer}
          api={api}
          layer={layer}
          meshSize={meshSize}
          visibleBox={visibleBox}
          onPointerMove={i === layers.length - 1 ? onPointerMove : undefined} // Attach tooltip handler only to the top layer
          {...colorMapProps}
        />
      ))}
    </group>
  );
}

export type { Props as TiledHeatmapMeshProps };
export default TiledHeatmapMesh;
