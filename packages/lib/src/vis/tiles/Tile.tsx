import { memo } from 'react';
import { Vector2 } from 'three';
import type { TextureFilter } from 'three';

import HeatmapMesh from '../heatmap/HeatmapMesh';
import { useAxisSystemContext } from '../shared/AxisSystemContext';
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

  const { visSize } = useAxisSystemContext();

  const array = api.get(lod, new Vector2(x, y));
  const [height, width] = array.shape;

  return (
    <group
      position={[x + width / 2, y + height / 2, 0]} // Tile center
      scale={[width / visSize.width, height / visSize.height, 1]}
    >
      <HeatmapMesh values={array} {...colorMapProps} magFilter={magFilter} />
    </group>
  );
}

export default memo(Tile);
