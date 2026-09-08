import { useThrottledCallback } from '@react-hookz/web';
import { type ThreeEvent } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { type MagnificationTextureFilter, Vector2 } from 'three';

import HeatmapMesh from '../heatmap/HeatmapMesh';
import { type TilesApi } from './api';
import { type ColorMapProps, type TileArray } from './models';

interface Props extends ColorMapProps {
  api: TilesApi;
  layer: number;
  x: number;
  y: number;
  magFilter: MagnificationTextureFilter;
  onPointerMove?: (e: ThreeEvent<MouseEvent>, array: TileArray) => void;
}

function Tile(props: Props) {
  const { api, layer, x, y, magFilter, onPointerMove, ...colorMapProps } =
    props;

  const { data: array } = useQuery({
    queryKey: ['tile', layer, x, y],
    queryFn: async () => api.get(layer, new Vector2(x, y)),
  });

  const handlePointerMove = useThrottledCallback(
    (e: ThreeEvent<MouseEvent>) => {
      onPointerMove!(e, array!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },
    [array, onPointerMove],
    50,
  );

  if (!array) {
    return null;
  }

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
        onPointerMove={onPointerMove && handlePointerMove}
      />
    </group>
  );
}

export default memo(Tile);
