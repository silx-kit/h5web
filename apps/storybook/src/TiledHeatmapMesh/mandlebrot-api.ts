import type { Size } from '@h5web/lib';
import { getLayerSizes, TilesApi } from '@h5web/lib';
import { createFetchStore } from '@h5web/shared/react-suspense-fetch';
import type { Domain } from '@h5web/shared/vis-models';
import greenlet from 'greenlet';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';
import type { Vector2 } from 'three';
import { MathUtils } from 'three';

import type { TileParams } from './models';
import { areTilesEqual } from './utils';

// https://en.wikipedia.org/wiki/Mandelbrot_set
const mandlebrot = greenlet(
  async (
    iterations: number,
    xDomain: Domain,
    yDomain: Domain,
    width: number,
    height: number,
  ): Promise<Float32Array> => {
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];

    const array = new Float32Array(height * width);

    for (let row = 0; row < height; row += 1) {
      const cImag = yDomain[0] + yRange * (row / (height - 1));
      for (let col = 0; col < width; col += 1) {
        let value = 0;

        const cReal = xDomain[0] + xRange * (col / (width - 1));
        // z = c
        let zReal = cReal;
        let zImag = cImag;
        for (let index = 0; index <= iterations; index += 1) {
          // z = z**2 + c
          const zRealSq = zReal ** 2;
          const zImagSq = zImag ** 2;
          zImag = 2 * zReal * zImag + cImag;
          zReal = zRealSq - zImagSq + cReal;

          // check divergence
          if (zRealSq + zImagSq > 4) {
            value = index / iterations;
            break;
          }
        }

        array[row * width + col] = value;
      }
    }

    return array;
  },
);

export class MandelbrotTilesApi extends TilesApi {
  public readonly xDomain: Domain;
  public readonly yDomain: Domain;
  private readonly store;

  public constructor(
    size: Size,
    tileSize: Size,
    xDomain: Domain,
    yDomain: Domain,
  ) {
    super(tileSize, getLayerSizes(size, tileSize));
    this.xDomain = xDomain;
    this.yDomain = yDomain;

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

      const xScale = (this.xDomain[1] - this.xDomain[0]) / layerSize.width;
      const xRange: Domain = [
        this.xDomain[0] + xScale * offset.x,
        this.xDomain[0] + xScale * (offset.x + width),
      ];
      const yScale = (this.yDomain[1] - this.yDomain[0]) / layerSize.height;
      const yRange: Domain = [
        this.yDomain[0] + yScale * offset.y,
        this.yDomain[0] + yScale * (offset.y + height),
      ];

      const arr = await mandlebrot(50, xRange, yRange, width, height);
      return ndarray(arr, [height, width]);
    }, areTilesEqual);
  }

  public get(layer: number, offset: Vector2): NdArray<Float32Array> {
    return this.store.get({ layer, offset });
  }
}
