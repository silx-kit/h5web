import type { ThreeEvent } from '@react-three/fiber';
import { throttle } from 'lodash';
import { memo } from 'react';
import { Vector2 } from 'three';
import type { TextureFilter } from 'three';

import HeatmapMesh from '../heatmap/HeatmapMesh';
import type { TilesApi } from './api';
import type { ColorMapProps, TileArray } from './models';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
  x: number;
  y: number;
  magFilter: TextureFilter;
  onPointerMove?: (e: ThreeEvent<MouseEvent>, array: TileArray) => void;
}

function Tile(props: Props) {
  const { api, layer, x, y, magFilter, onPointerMove, ...colorMapProps } =
    props;

  const array = api.get(layer, new Vector2(x, y));
  const [height, width] = array.shape;

  const handlePointerMove =
    onPointerMove &&
    throttle(
      (e: ThreeEvent<MouseEvent>) => {
        onPointerMove(e, array);
      },
      50,
      { trailing: false }
    );

  return (
    <group
      position={[x + width / 2, y + height / 2, 0]} // Tile center
    >
      <HeatmapMesh
        values={array}
        {...colorMapProps}
        magFilter={magFilter}
        size={{ width, height }}
        onPointerMove={handlePointerMove}
      />
    </group>
  );
}

export default memo(Tile);
