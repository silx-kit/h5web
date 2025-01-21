import { getLayerSizes, type Size, TilesApi } from '@h5web/lib';
import { createFetchStore } from '@h5web/shared/react-suspense-fetch';
import greenlet from 'greenlet';
import ndarray, { type NdArray } from 'ndarray';
import { MathUtils, type Vector2 } from 'three';

import { type TileParams } from './models';
import { areTilesEqual } from './utils';

const getCheckerboardArray = greenlet(
  async (length: number, value: number): Promise<Uint8Array> => {
    return Uint8Array.from({ length }, () => value);
  },
);

export class CheckerboardTilesApi extends TilesApi {
  private readonly store;

  public constructor(size: Size, tileSize: Size) {
    super(tileSize, getLayerSizes(size, tileSize));

    this.store = createFetchStore(async (tile: TileParams) => {
      const { layer, offset } = tile;
      const layerSize = this.layerSizes[layer];

      // Clip slice to size of the level
      const width = MathUtils.clamp(
        layerSize.width - offset.x,
        0,
        this.tileSize.width,
      );
      const height = MathUtils.clamp(
        layerSize.height - offset.y,
        0,
        this.tileSize.height,
      );

      const value = Math.abs(
        (Math.floor(offset.x / this.tileSize.width) % 2) -
          (Math.floor(offset.y / this.tileSize.height) % 2),
      );

      const arr = await getCheckerboardArray(width * height, value);
      return ndarray(arr, [height, width]);
    }, areTilesEqual);
  }

  public get(layer: number, offset: Vector2): NdArray<Uint8Array> {
    return this.store.get({ layer, offset });
  }
}
