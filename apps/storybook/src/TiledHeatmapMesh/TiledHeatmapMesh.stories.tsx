import {
  type AxisConfig,
  DefaultInteractions,
  type Domain,
  TiledHeatmapMesh,
  type TiledHeatmapMeshProps,
  TiledTooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import { ScaleType } from '@h5web/shared/vis-models';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import FillHeight from '../decorators/FillHeight';
import { CheckerboardTilesApi } from './checkerboard-api';
import LinearAxesGroup from './LinearAxesGroup';
import { MandelbrotTilesApi } from './mandlebrot-api';
import { renderTooltip } from './utils';

interface TiledHeatmapStoryProps extends TiledHeatmapMeshProps {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

const defaultApi = new MandelbrotTilesApi(
  { width: 1e9, height: 1e9 },
  { width: 128, height: 128 },
  [-2, 1],
  [-1.5, 1.5],
);
const halfMandelbrotApi = new MandelbrotTilesApi(
  { width: 1e9, height: 5e8 },
  { width: 256, height: 128 },
  [-2, 1],
  [0, 1.5],
);
const checkerboardApi = new CheckerboardTilesApi(
  { width: 1e9, height: 1e9 },
  { width: 128, height: 128 },
);

const meta = {
  title: 'Experimental/TiledHeatmapMesh',
  component: TiledHeatmapMesh,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    invertColorMap: false,
    colorMap: 'Viridis',
    domain: [0, 1],
    scaleType: ScaleType.Linear,
    displayLowerResolutions: true,
    qualityFactor: 1,
  },
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    qualityFactor: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
  },
} satisfies Meta<TiledHeatmapStoryProps>;

export default meta;
type Story = StoryObj<TiledHeatmapStoryProps>;

export const Default = {
  render: (args) => {
    const { abscissaConfig, ordinateConfig, ...tiledHeatmapProps } = args;

    return (
      <VisCanvas
        abscissaConfig={abscissaConfig}
        ordinateConfig={ordinateConfig}
        aspect="equal"
      >
        <DefaultInteractions />
        <group
          scale={[
            abscissaConfig.flip ? -1 : 1,
            ordinateConfig.flip ? -1 : 1,
            1,
          ]}
        >
          <TiledHeatmapMesh {...tiledHeatmapProps} />
        </group>
        <TiledTooltipMesh renderTooltip={renderTooltip} />
      </VisCanvas>
    );
  },
  args: {
    api: defaultApi,
    abscissaConfig: {
      visDomain: [0, defaultApi.baseLayerSize.width],
      isIndexAxis: true,
    },
    ordinateConfig: {
      visDomain: [0, defaultApi.baseLayerSize.height],
      isIndexAxis: true,
    },
  },
} satisfies Story;

export const AxisValues = {
  ...Default,
  args: {
    api: halfMandelbrotApi,
    abscissaConfig: { visDomain: halfMandelbrotApi.xDomain, showGrid: false },
    ordinateConfig: { visDomain: halfMandelbrotApi.yDomain, showGrid: false },
  },
} satisfies Story;

export const DescendingAxisValues = {
  ...Default,
  args: {
    api: halfMandelbrotApi,
    abscissaConfig: {
      visDomain: [...halfMandelbrotApi.xDomain].reverse() as Domain,
    },
    ordinateConfig: {
      visDomain: [...halfMandelbrotApi.yDomain].reverse() as Domain,
    },
  },
} satisfies Story;

export const FlippedAxes = {
  ...Default,
  args: {
    api: halfMandelbrotApi,
    abscissaConfig: {
      visDomain: [0, halfMandelbrotApi.baseLayerSize.width],
      isIndexAxis: true,
      flip: true,
    },
    ordinateConfig: {
      visDomain: [0, halfMandelbrotApi.baseLayerSize.height],
      isIndexAxis: true,
      flip: true,
    },
  },
} satisfies Story;

export const Checkerboard = {
  ...Default,
  args: {
    api: checkerboardApi,
    abscissaConfig: {
      visDomain: [0, checkerboardApi.baseLayerSize.width],
      isIndexAxis: true,
    },
    ordinateConfig: {
      visDomain: [0, checkerboardApi.baseLayerSize.height],
      isIndexAxis: true,
    },
  },
} satisfies Story;

export const WithTransforms = {
  render: (args) => {
    const { abscissaConfig, api, ordinateConfig, ...tiledHeatmapProps } = args;
    const { baseLayerSize } = api;
    const size = {
      width: 1,
      height: baseLayerSize.height / baseLayerSize.width,
    };

    return (
      <VisCanvas
        abscissaConfig={abscissaConfig}
        ordinateConfig={ordinateConfig}
        aspect="equal"
      >
        <DefaultInteractions />
        <LinearAxesGroup>
          <group position={[1, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <TiledHeatmapMesh api={api} size={size} {...tiledHeatmapProps} />
            <TiledTooltipMesh size={size} renderTooltip={renderTooltip} />
          </group>
          <group position={[-1, 1, 0]} scale={[2, 2, 1]}>
            <TiledHeatmapMesh api={api} size={size} {...tiledHeatmapProps} />
            <TiledTooltipMesh size={size} renderTooltip={renderTooltip} />
          </group>
        </LinearAxesGroup>
      </VisCanvas>
    );
  },
  args: {
    api: halfMandelbrotApi,
    abscissaConfig: {
      visDomain: [-2, 1.5],
      isIndexAxis: true,
      flip: true,
    },
    ordinateConfig: {
      visDomain: [0, 2],
      isIndexAxis: true,
      flip: true,
    },
  },
} satisfies Story;
