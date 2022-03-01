import { memo } from 'react';
import { Vector2 } from 'three';
import type { TextureFilter } from 'three';

import HeatmapMesh from '../heatmap/HeatmapMesh';
import type { TilesApi } from './api';
import type { ColorMapProps } from './models';

interface Props extends ColorMapProps {
  api: TilesApi;
  lod: number;
  x: number;
  y: number;
  magFilter: TextureFilter;
}

function Tile(props: Props) {
  const { api, lod, x, y, magFilter, ...colorMapProps } = props;

  const array = api.get(lod, new Vector2(x, y));
  const [height, width] = array.shape;

  return (
    <group
      position={[x + width / 2, y + height / 2, 0]} // Tile center
    >
      <HeatmapMesh
        values={array}
        {...colorMapProps}
        magFilter={magFilter}
        size={{ width, height }}
      />
    </group>
  );
}

export default memo(Tile);
