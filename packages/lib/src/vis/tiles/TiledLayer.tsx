import { Suspense, useRef } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';
import type { Group } from 'three';

import { useCameraState } from '../hooks';
import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import Tile from './Tile';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';
import {
  getTileOffsets,
  getScaledVisibleBox,
  sortTilesByDistanceTo,
} from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
  size: Size;
}

function TiledLayer(props: Props) {
  const { api, layer, size: meshSize, ...colorMapProps } = props;

  const { baseLayerIndex, numLayers, tileSize } = api;
  const layerSize = api.layerSizes[layer];

  const groupRef = useRef<Group>(null);
  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();
  const box = useCameraState(
    (...args) => getScaledVisibleBox(...args, meshSize, layerSize, groupRef),
    [meshSize, layerSize, groupRef]
  );

  let tileOffsets: Vector2[] = [];
  if (box) {
    tileOffsets = getTileOffsets(box, tileSize);

    // Sort tiles from closest to vis center to farthest away
    sortTilesByDistanceTo(tileOffsets, tileSize, box.getCenter(new Vector2()));
  }

  return (
    // Transforms to handle axes flip and use level of details layer array coordinates
    <group
      ref={groupRef}
      scale={[abscissaConfig.flip ? -1 : 1, ordinateConfig.flip ? -1 : 1, 1]}
    >
      <group
        position={[
          -meshSize.width / 2,
          -meshSize.height / 2,
          layer / numLayers,
        ]}
        scale={[
          meshSize.width / layerSize.width,
          meshSize.height / layerSize.height,
          1,
        ]}
      >
        {tileOffsets.map((offset) => (
          <Suspense key={`${offset.x},${offset.y}`} fallback={null}>
            <Tile
              api={api}
              layer={layer}
              x={offset.x}
              y={offset.y}
              {...colorMapProps}
              magFilter={
                layer === baseLayerIndex ? NearestFilter : LinearFilter
              }
            />
          </Suspense>
        ))}
      </group>
    </group>
  );
}

export default TiledLayer;
