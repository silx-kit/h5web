import type { ThreeEvent } from '@react-three/fiber';
import { Suspense } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';
import type { Box3 } from 'three';

import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import Tile from './Tile';
import type { TilesApi } from './api';
import { useLayerScales } from './hooks';
import type { ColorMapProps, TileArray } from './models';
import { getTileOffsets, scaleBox, sortTilesByDistanceTo } from './utils';

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

  const { baseLayerIndex, numLayers, tileSize } = api;
  const layerSize = api.layerSizes[layer];
  const { xScale, yScale } = useLayerScales(layerSize, meshSize);
  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();

  if (visibleBox.isEmpty()) {
    return null;
  }

  const bounds = scaleBox(visibleBox, xScale, yScale);
  const tileOffsets = getTileOffsets(bounds, tileSize);
  // Sort tiles from closest to vis center to farthest away
  sortTilesByDistanceTo(tileOffsets, tileSize, bounds.getCenter(new Vector2()));

  return (
    // Transforms to use level of details layer array coordinates
    <group
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
              onPointerMove={onPointerMove}
            />
          </Suspense>
        ))}
      </group>
    </group>
  );
}

export default TiledLayer;
