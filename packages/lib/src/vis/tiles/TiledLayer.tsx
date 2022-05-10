import { Suspense } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';
import type { Box3 } from 'three';

import type { Size } from '../models';
import Tile from './Tile';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';
import { getTileOffsets, scaleToLayer, sortTilesByDistanceTo } from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
  meshSize: Size;
  visibleBox: Box3;
}

function TiledLayer(props: Props) {
  const { api, layer, meshSize, visibleBox, ...colorMapProps } = props;

  const { baseLayerIndex, numLayers, tileSize } = api;
  const layerSize = api.layerSizes[layer];

  if (visibleBox.isEmpty()) {
    return null;
  }

  const bounds = scaleToLayer(visibleBox, layerSize, meshSize);
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
          />
        </Suspense>
      ))}
    </group>
  );
}

export default TiledLayer;
