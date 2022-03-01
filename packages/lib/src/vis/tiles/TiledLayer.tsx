import { Suspense } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';

import { useVisibleDomains } from '../hooks';
import { useAxisSystemContext } from '../shared/AxisSystemContext';
import Tile from './Tile';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';
import { getTileOffsets, sortTilesByDistanceTo } from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
}

function TiledLayer(props: Props) {
  const { api, layer, ...colorMapProps } = props;

  const { imageLayerIndex, imageSize, numLayers } = api;
  const { width, height } = api.layerSizes[layer];
  const { tileSize } = api;

  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const { visSize } = useAxisSystemContext();

  // Transform visible domain to current level-of-detail array coordinates
  const xScale = width / imageSize.width;
  const yScale = height / imageSize.height;
  const origin = new Vector2(
    Math.max(0, xVisibleDomain[0] * xScale),
    Math.max(0, yVisibleDomain[0] * yScale)
  );
  const end = new Vector2(
    Math.min(width, xVisibleDomain[1] * xScale),
    Math.min(height, yVisibleDomain[1] * yScale)
  );
  const tileOffsets = getTileOffsets(origin, end, tileSize);

  // Sort tiles from closest to vis center to farthest away
  const center = new Vector2((origin.x + end.x) / 2, (origin.y + end.y) / 2);
  sortTilesByDistanceTo(tileOffsets, tileSize, center);

  return (
    // Tranforms to use level of details layer array coordinates
    <group
      position={[-visSize.width / 2, -visSize.height / 2, layer / numLayers]}
      scale={[visSize.width / width, visSize.height / height, 1]}
    >
      {tileOffsets.map((offset) => (
        <Suspense key={`${offset.x},${offset.y}`} fallback={null}>
          <Tile
            api={api}
            layer={layer}
            x={offset.x}
            y={offset.y}
            {...colorMapProps}
            magFilter={layer === imageLayerIndex ? NearestFilter : LinearFilter}
          />
        </Suspense>
      ))}
    </group>
  );
}

export default TiledLayer;
