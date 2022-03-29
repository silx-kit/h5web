import { sum } from 'lodash';
import { Suspense } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';

import { useAxisSystemContext } from '../shared/AxisSystemContext';
import Tile from './Tile';
import type { TilesApi } from './api';
import { useScaledVisibleDomains } from './hooks';
import type { ColorMapProps } from './models';
import { getTileOffsets, sortTilesByDistanceTo } from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
}

function TiledLayer(props: Props) {
  const { api, layer, ...colorMapProps } = props;

  const { baseLayerIndex, numLayers, tileSize } = api;
  const layerSize = api.layerSizes[layer];

  const { visSize } = useAxisSystemContext();
  const { xVisibleDomain, yVisibleDomain } = useScaledVisibleDomains(layerSize);

  // Transform visible domain to current level-of-detail array coordinates
  const tileOffsets = getTileOffsets(xVisibleDomain, yVisibleDomain, tileSize);

  // Sort tiles from closest to vis center to farthest away
  const center = new Vector2(sum(xVisibleDomain) / 2, sum(yVisibleDomain) / 2);
  sortTilesByDistanceTo(tileOffsets, tileSize, center);

  return (
    // Tranforms to use level of details layer array coordinates
    <group
      position={[-visSize.width / 2, -visSize.height / 2, layer / numLayers]}
      scale={[
        visSize.width / layerSize.width,
        visSize.height / layerSize.height,
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
