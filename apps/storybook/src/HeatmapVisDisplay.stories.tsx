import {
  Annotation,
  DefaultInteractions,
  getMockDataArray,
  HeatmapVis,
} from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

import HeatmapVisStoriesMeta from './HeatmapVis.stories';

const dataArray = getMockDataArray('/nD_datasets/twoD');

const meta = {
  ...HeatmapVisStoriesMeta,
  title: 'Visualizations/HeatmapVis/Display',
} satisfies Meta<typeof HeatmapVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AutoAspectRatio = {
  args: {
    aspect: 'auto',
  },
} satisfies Story;

export const CustomAspectRatio = {
  args: {
    aspect: 2,
  },
} satisfies Story;

export const FlipYAxis = {
  args: {
    flipYAxis: true,
  },
} satisfies Story;

export const NoGrid = {
  args: {
    showGrid: false,
  },
} satisfies Story;

export const CustomTooltip = {
  args: {
    abscissaParams: {
      value: Array.from({ length: dataArray.shape[1] }, (_, i) => 100 + 10 * i),
    },
    ordinateParams: {
      value: Array.from({ length: dataArray.shape[0] }, (_, i) => -5 + 0.5 * i),
    },
    renderTooltip: (data) => {
      const { abscissa, ordinate, xi, yi, x, y } = data;
      return (
        <>
          <div>
            <strong>{`value = ${dataArray.get(yi, xi)}`}</strong>
          </div>
          <div>{`abscissa = ${abscissa}, ordinate = ${ordinate}`}</div>
          <div>{`xi = ${xi}, yi = ${yi}`}</div>
          <div>{`x = ${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}</div>
        </>
      );
    },
  },
} satisfies Story;

export const WheelCapture = {
  decorators: [
    (VisCanvasStory: StoryFn) => (
      <>
        <div style={{ display: 'flex', height: '100vh' }}>
          <VisCanvasStory />
        </div>
        <div style={{ height: 500 }} />
      </>
    ),
  ],
} satisfies Story;

export const WithTitle = {
  args: {
    title: 'Pretty colors',
  },
} satisfies Story;

export const WithAxisLabels = {
  args: {
    abscissaParams: { label: 'Latitude' },
    ordinateParams: { label: 'Longitude' },
  },
} satisfies Story;

export const WithAnnotation = {
  render: (args) => (
    <HeatmapVis {...args}>
      <DefaultInteractions />
      <Annotation x={10} y={16} style={{ color: 'white' }}>
        HTML annotation positioned at (10, 16)
      </Annotation>
      <Annotation
        x={25}
        y={10}
        center
        style={{ width: 180, color: 'white', textAlign: 'center' }}
      >
        Another annotation, <strong>centred</strong> on (25, 10)
      </Annotation>
    </HeatmapVis>
  ),
} satisfies Story;
