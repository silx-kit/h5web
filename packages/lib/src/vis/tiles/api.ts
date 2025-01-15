import { type Vector2 } from 'three';

import { type Size } from '../models';
import { type TileArray } from './models';

export function getLayerSizes(
  baseLayerSize: Size,
  tileSize: Size,
  roundToEven = false,
): Size[] {
  if (
    baseLayerSize.width <= tileSize.width &&
    baseLayerSize.height <= tileSize.height
  ) {
    return [baseLayerSize];
  }

  const nextLayerSize: Size = roundToEven
    ? {
        width: Math.floor(baseLayerSize.width / 2),
        height: Math.floor(baseLayerSize.height / 2),
      }
    : {
        width: 1 + Math.floor((baseLayerSize.width - 1) / 2),
        height: 1 + Math.floor((baseLayerSize.height - 1) / 2),
      };
  return [
    ...getLayerSizes(nextLayerSize, tileSize, roundToEven),
    baseLayerSize,
  ];
}

export abstract class TilesApi {
  public readonly tileSize: Size;
  public readonly layerSizes: Size[];

  public constructor(tileSize: Size, layerSizes: Size[]) {
    if (layerSizes.length === 0) {
      throw new Error('layerSizes must not be empty');
    }
    this.tileSize = tileSize;
    this.layerSizes = layerSizes;
  }

  public get baseLayerSize(): Size {
    return this.layerSizes[this.numLayers - 1];
  }

  public get baseLayerIndex(): number {
    return this.numLayers - 1;
  }

  public get numLayers(): number {
    return this.layerSizes.length;
  }

  public abstract get(layer: number, offset: Vector2): TileArray;
}
