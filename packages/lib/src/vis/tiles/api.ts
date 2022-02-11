import type { NdArray } from 'ndarray';
import type { Vector2 } from 'three';

import type { TextureSafeTypedArray } from '../heatmap/models';
import type { Size } from '../models';

export function getLayerSizes(
  imageSize: Size,
  tileSize: Size,
  roundToEven = false
): Size[] {
  if (
    imageSize.width <= tileSize.width &&
    imageSize.height <= tileSize.height
  ) {
    return [imageSize];
  }

  const nextLayerSize: Size = roundToEven
    ? {
        width: Math.floor(imageSize.width / 2),
        height: Math.floor(imageSize.height / 2),
      }
    : {
        width: 1 + Math.floor((imageSize.width - 1) / 2),
        height: 1 + Math.floor((imageSize.height - 1) / 2),
      };
  return [imageSize, ...getLayerSizes(nextLayerSize, tileSize, roundToEven)];
}

export abstract class TilesApi {
  public readonly tileSize: Size;
  public readonly layerSizes: Size[];

  public constructor(tileSize: Size, layerSizes: Size[]) {
    this.tileSize = tileSize;
    this.layerSizes = layerSizes;
  }

  public abstract get(
    lod: number,
    offset: Vector2
  ): NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
}
