import { sum } from 'lodash';
import { Suspense } from 'react';
import { LinearFilter, NearestFilter, Vector2 } from 'three';

import { useCameraState } from '../hooks';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import Tile from './Tile';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';
import {
  getTileOffsets,
  getScaledVisibleDomains,
  sortTilesByDistanceTo,
} from './utils';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
}

function TiledLayer(props: Props) {
  const { api, layer, ...colorMapProps } = props;

  const { baseLayerIndex, numLayers, tileSize } = api;
  const layerSize = api.layerSizes[layer];

  const { abscissaConfig, ordinateConfig, visSize } = useAxisSystemContext();
  const { xVisibleDomain, yVisibleDomain } = useCameraState(
    (...args) => getScaledVisibleDomains(...args, layerSize),
    [layerSize]
  );

  const tileOffsets = getTileOffsets(xVisibleDomain, yVisibleDomain, tileSize);

  // Sort tiles from closest to vis center to farthest away
  const center = new Vector2(sum(xVisibleDomain) / 2, sum(yVisibleDomain) / 2);
  sortTilesByDistanceTo(tileOffsets, tileSize, center);

  return (
    // Transforms to handle axes flip and use level of details layer array coordinates
    <group
      scale={[abscissaConfig.flip ? -1 : 1, ordinateConfig.flip ? -1 : 1, 1]}
    >
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
