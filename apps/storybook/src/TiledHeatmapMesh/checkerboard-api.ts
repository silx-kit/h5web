import { getLayerSizes, type Size, TilesApi } from '@h5web/lib';
import greenlet from 'greenlet';
import ndarray, { type NdArray } from 'ndarray';
import { MathUtils, type Vector2 } from 'three';

const getCheckerboardArray = greenlet(
  async (length: number, value: number): Promise<Uint8Array> => {
    return Uint8Array.from({ length }, () => value);
  },
);

export class CheckerboardTilesApi extends TilesApi {
  public constructor(size: Size, tileSize: Size) {
    super(tileSize, getLayerSizes(size, tileSize));
  }

  public async get(
    layer: number,
    offset: Vector2,
  ): Promise<NdArray<Uint8Array>> {
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
  }
}
