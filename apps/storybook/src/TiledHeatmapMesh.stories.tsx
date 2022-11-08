import {
  getLayerSizes,
  Pan,
  VisCanvas,
  Zoom,
  TiledHeatmapMesh,
  TilesApi,
  ResetZoomButton,
  SelectToZoom,
  useAxisSystemContext,
  TiledTooltipMesh,
} from '@h5web/lib';
import type {
  Domain,
  Size,
  TiledHeatmapMeshProps,
  AxisConfig,
} from '@h5web/lib';
import { formatTooltipVal, ScaleType } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import greenlet from 'greenlet';
import { clamp } from 'lodash';
import ndarray from 'ndarray';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';
import { createFetchStore } from 'react-suspense-fetch';
import type { Vector2 } from 'three';

import FillHeight from './decorators/FillHeight';

// See https://en.wikipedia.org/wiki/Mandelbrot_set
const mandelbrot = greenlet(
  (
    iterations: number,
    xDomain: Domain,
    yDomain: Domain,
    size: Size
  ): Promise<Float32Array> => {
    const { width, height } = size;
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

    return Promise.resolve(array);
  }
);

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

        const arr = await mandelbrot(50, xRange, yRange, { width, height });
        return ndarray(arr, [height, width]);
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

class CheckboardTilesApi extends TilesApi {
  public constructor(size: Size, tileSize: Size) {
    super(tileSize, getLayerSizes(size, tileSize));
  }

  public get(layer: number, offset: Vector2): NdArray<Uint8Array> {
    const layerSize = this.layerSizes[layer];
    // Clip slice to size of the level
    const width = clamp(layerSize.width - offset.x, 0, this.tileSize.width);
    const height = clamp(layerSize.height - offset.y, 0, this.tileSize.height);

    const value = Math.abs(
      (Math.floor(offset.x / this.tileSize.width) % 2) -
        (Math.floor(offset.y / this.tileSize.height) % 2)
    );
    const arr = Uint8Array.from({ length: height * width }, () => value);
    return ndarray(arr, [height, width]);
  }
}

interface TiledHeatmapStoryProps extends TiledHeatmapMeshProps {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  showTooltip: boolean;
  showAxes: boolean;
}

const renderTooltip = (x: number, y: number, v: number) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
    <strong>{formatTooltipVal(v)}</strong>
  </div>
);
const Template: Story<TiledHeatmapStoryProps> = (args) => {
  const {
    abscissaConfig,
    ordinateConfig,
    showTooltip,
    showAxes = true,
    ...tiledHeatmapProps
  } = args;

  return (
    <VisCanvas
      abscissaConfig={abscissaConfig}
      ordinateConfig={ordinateConfig}
      visRatio={Math.abs(
        (abscissaConfig.visDomain[1] - abscissaConfig.visDomain[0]) /
          (ordinateConfig.visDomain[1] - ordinateConfig.visDomain[0])
      )}
      showAxes={showAxes}
    >
      <Pan />
      <Zoom />
      <SelectToZoom keepRatio modifierKey="Control" />
      <ResetZoomButton />
      <TiledHeatmapMesh {...tiledHeatmapProps} />
      {showTooltip && <TiledTooltipMesh renderTooltip={renderTooltip} />}
    </VisCanvas>
  );
};

const defaultApi = new MandelbrotTilesApi(
  { width: 1e9, height: 1e9 },
  { width: 128, height: 128 },
  [-2, 1],
  [-1.5, 1.5]
);
const halfMandelbrotApi = new MandelbrotTilesApi(
  { width: 1e9, height: 5e8 },
  { width: 256, height: 128 },
  [-2, 1],
  [0, 1.5]
);
const checkboardApi = new CheckboardTilesApi(
  { width: 1e9, height: 1e9 },
  { width: 128, height: 128 }
);

export const Default = Template.bind({});
Default.args = {
  api: defaultApi,
  abscissaConfig: {
    visDomain: [0, defaultApi.baseLayerSize.width],
    isIndexAxis: true,
    showGrid: false,
  },
  ordinateConfig: {
    visDomain: [0, defaultApi.baseLayerSize.height],
    isIndexAxis: true,
    showGrid: false,
  },
};

export const AxisValues = Template.bind({});
AxisValues.args = {
  api: halfMandelbrotApi,
  abscissaConfig: { visDomain: halfMandelbrotApi.xDomain, showGrid: false },
  ordinateConfig: { visDomain: halfMandelbrotApi.yDomain, showGrid: false },
};

export const DescendingAxisValues = Template.bind({});
DescendingAxisValues.args = {
  api: halfMandelbrotApi,
  abscissaConfig: {
    visDomain: [...halfMandelbrotApi.xDomain].reverse() as Domain,
    showGrid: false,
  },
  ordinateConfig: {
    visDomain: [...halfMandelbrotApi.yDomain].reverse() as Domain,
    showGrid: false,
  },
};

export const FlippedAxes = Template.bind({});
FlippedAxes.args = {
  api: halfMandelbrotApi,
  abscissaConfig: {
    visDomain: [0, halfMandelbrotApi.baseLayerSize.width],
    isIndexAxis: true,
    showGrid: false,
    flip: true,
  },
  ordinateConfig: {
    visDomain: [0, halfMandelbrotApi.baseLayerSize.height],
    isIndexAxis: true,
    showGrid: false,
    flip: true,
  },
};

export const NoAxes = Template.bind({});
NoAxes.args = {
  ...Default.args,
  showAxes: false,
};

function LinearAxesGroup(props: { children: ReactNode }) {
  const { children } = props;
  const { abscissaConfig, ordinateConfig, visSize } = useAxisSystemContext();
  const { width, height } = visSize;
  const sx =
    ((abscissaConfig.flip ? -1 : 1) * width) /
    (abscissaConfig.visDomain[1] - abscissaConfig.visDomain[0]);
  const sy =
    ((ordinateConfig.flip ? -1 : 1) * height) /
    (ordinateConfig.visDomain[1] - ordinateConfig.visDomain[0]);
  const x = 0.5 * (abscissaConfig.visDomain[0] + abscissaConfig.visDomain[1]);
  const y = 0.5 * (ordinateConfig.visDomain[0] + ordinateConfig.visDomain[1]);

  return (
    <group position={[-x * sx, -y * sy, 0]} scale={[sx, sy, 1]}>
      {children}
    </group>
  );
}

export const WithTransforms: Story<TiledHeatmapStoryProps> = (args) => {
  const {
    abscissaConfig,
    api,
    ordinateConfig,
    showTooltip,
    ...tiledHeatmapProps
  } = args;
  const { baseLayerSize } = api;
  const size = { width: 1, height: baseLayerSize.height / baseLayerSize.width };

  return (
    <VisCanvas
      abscissaConfig={abscissaConfig}
      ordinateConfig={ordinateConfig}
      visRatio={Math.abs(
        (abscissaConfig.visDomain[1] - abscissaConfig.visDomain[0]) /
          (ordinateConfig.visDomain[1] - ordinateConfig.visDomain[0])
      )}
    >
      <Pan />
      <Zoom />
      <SelectToZoom keepRatio modifierKey="Control" />
      <ResetZoomButton />
      <LinearAxesGroup>
        <group position={[1, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <TiledHeatmapMesh api={api} size={size} {...tiledHeatmapProps} />
          {showTooltip && (
            <TiledTooltipMesh size={size} renderTooltip={renderTooltip} />
          )}
        </group>
        <group position={[-1, 1, 0]} scale={[2, 2, 1]}>
          <TiledHeatmapMesh api={api} size={size} {...tiledHeatmapProps} />
          {showTooltip && (
            <TiledTooltipMesh size={size} renderTooltip={renderTooltip} />
          )}
        </group>
      </LinearAxesGroup>
    </VisCanvas>
  );
};
WithTransforms.args = {
  api: halfMandelbrotApi,
  abscissaConfig: {
    visDomain: [-2, 1.5],
    isIndexAxis: true,
    showGrid: false,
    flip: false,
  },
  ordinateConfig: {
    visDomain: [0, 2],
    isIndexAxis: true,
    showGrid: false,
    flip: false,
  },
};

export const Checkboard = Template.bind({});
Checkboard.args = {
  api: checkboardApi,
  abscissaConfig: {
    visDomain: [0, checkboardApi.baseLayerSize.width],
    isIndexAxis: true,
    showGrid: false,
  },
  ordinateConfig: {
    visDomain: [0, checkboardApi.baseLayerSize.height],
    isIndexAxis: true,
    showGrid: false,
  },
};

export default {
  title: 'Experimental/TiledHeatmapMesh',
  component: TiledHeatmapMesh,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  args: {
    invertColorMap: false,
    colorMap: 'Viridis',
    domain: [0, 1],
    scaleType: ScaleType.Linear,
    displayLowerResolutions: true,
    qualityFactor: 1,
    showTooltip: true,
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
