import type { Size } from '@h5web/lib';
import { getLayerSizes, TilesApi } from '@h5web/lib';
import greenlet from 'greenlet';
import { clamp } from 'lodash';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';
import { createFetchStore } from 'react-suspense-fetch';
import type { Vector2 } from 'three';

import type { TileParams } from './models';
import { areTilesEqual } from './utils';

const getCheckerboardArray = greenlet(
  async (length: number, value: number): Promise<Uint8Array> => {
    return Uint8Array.from({ length }, () => value);
  }
);

export class CheckerboardTilesApi extends TilesApi {
  private readonly store;

  public constructor(size: Size, tileSize: Size) {
    super(tileSize, getLayerSizes(size, tileSize));

    this.store = createFetchStore(
      async (tile: TileParams) => {
        const { layer, offset } = tile;
        const layerSize = this.layerSizes[layer];

        // Clip slice to size of the level
        const width = clamp(layerSize.width - offset.x, 0, this.tileSize.width);
        const height = clamp(
          layerSize.height - offset.y,
          0,
          this.tileSize.height
        );

        const value = Math.abs(
          (Math.floor(offset.x / this.tileSize.width) % 2) -
            (Math.floor(offset.y / this.tileSize.height) % 2)
        );

        const arr = await getCheckerboardArray(width * height, value);
        return ndarray(arr, [height, width]);
      },
      { type: 'Map', areEqual: areTilesEqual }
    );
  }

  public get(layer: number, offset: Vector2): NdArray<Uint8Array> {
    return this.store.get({ layer, offset });
  }
}
