import type { ThreeEvent } from '@react-three/fiber';
import { Suspense } from 'react';
import type { Box3 } from 'three';
import { LinearFilter, NearestFilter, Vector2 } from 'three';

import type { Size } from '../models';
import type { TilesApi } from './api';
import type { ColorMapProps, TileArray } from './models';
import Tile from './Tile';
import {
  getTileOffsets,
  scaleBoxToLayer,
  sortTilesByDistanceTo,
} from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
  meshSize: Size;
  visibleBox: Box3;
  onPointerMove?: (e: ThreeEvent<MouseEvent>, array: TileArray) => void;
}

function TiledLayer(props: Props) {
  const { api, layer, meshSize, visibleBox, onPointerMove, ...colorMapProps } =
    props;

  const { baseLayerIndex, numLayers, tileSize, layerSizes } = api;
  const layerSize = layerSizes[layer];

  if (visibleBox.isEmpty()) {
    return null;
  }

  const bounds = scaleBoxToLayer(visibleBox, layerSize, meshSize);
  const tileOffsets = getTileOffsets(bounds, tileSize);
  // Sort tiles from closest to vis center to farthest away
  sortTilesByDistanceTo(tileOffsets, tileSize, bounds.getCenter(new Vector2()));

  return (
    // Transforms to use level of details layer array coordinates
    <group
      position={[-meshSize.width / 2, -meshSize.height / 2, layer / numLayers]}
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
            magFilter={layer === baseLayerIndex ? NearestFilter : LinearFilter}
            onPointerMove={onPointerMove}
          />
        </Suspense>
      ))}
    </group>
  );
}

export default TiledLayer;
