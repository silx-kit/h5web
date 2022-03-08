import {
  getLayerSizes,
  PanEvents,
  VisCanvas,
  ZoomEvents,
  TiledHeatmap,
  TilesApi,
} from '@h5web/lib';
import type { Domain, Size, TiledHeatmapProps } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import { clamp } from 'lodash';
import ndarray from 'ndarray';
import type { NdArray } from 'ndarray';
import { createFetchStore } from 'react-suspense-fetch';
import type { Vector2 } from 'three';

import FillHeight from './decorators/FillHeight';

// See https://en.wikipedia.org/wiki/Mandelbrot_set
function mandelbrot(
  iterations: number,
  xDomain: Domain,
  yDomain: Domain,
  size: Size
): NdArray<Float32Array> {
  const { width, height } = size;
  const xRange = xDomain[1] - xDomain[0];
  const yRange = yDomain[1] - yDomain[0];

  const array = ndarray(new Float32Array(height * width), [height, width]);

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

      array.set(row, col, value);
    }
  }
  return array;
}

interface TileParams {
  layer: number;
  offset: Vector2;
}

class MandelbrotTilesApi extends TilesApi {
  public readonly xDomain: Domain;
  public readonly yDomain: Domain;
  private readonly store;

  public constructor(
    size: Size,
    tileSize: Size,
    xDomain: Domain,
    yDomain: Domain
  ) {
    super(tileSize, getLayerSizes(size, tileSize));
    this.xDomain = xDomain;
    this.yDomain = yDomain;

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

        return mandelbrot(50, xRange, yRange, { width, height });
      },
      {
        type: 'Map',
        areEqual: (a: TileParams, b: TileParams) =>
          a.layer === b.layer && a.offset.equals(b.offset),
      }
    );
  }

  public get(layer: number, offset: Vector2): NdArray<Float32Array> {
    return this.store.get({ layer, offset });
  }
}
const Template: Story<TiledHeatmapProps> = (args) => {
  const { api, ...tiledHeatmapProps } = args;
  const { width, height } = api.baseLayerSize;

  return (
    <VisCanvas
      abscissaConfig={{
        visDomain: [0, width],
        isIndexAxis: true,
        showGrid: false,
      }}
      ordinateConfig={{
        visDomain: [0, height],
        isIndexAxis: true,
        showGrid: false,
      }}
      visRatio={width / height}
    >
      <PanEvents />
      <ZoomEvents />
      <TiledHeatmap api={api} {...tiledHeatmapProps} />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  api: new MandelbrotTilesApi(
    { width: 1e9, height: 1e9 },
    { width: 128, height: 128 },
    [-2, 1],
    [-1.5, 1.5]
  ),
  domain: [0, 1],
};

export default {
  title: 'Building Blocks/TiledHeatmap',
  component: TiledHeatmap,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  args: {
    invertColorMap: false,
    colorMap: 'Viridis',
    scaleType: ScaleType.Linear,
    displayLowerResolutions: true,
    qualityFactor: 1,
  },
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: [
        ScaleType.Linear,
        ScaleType.Log,
        ScaleType.SymLog,
        ScaleType.Sqrt,
      ],
    },
    qualityFactor: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
  },
} as Meta;
