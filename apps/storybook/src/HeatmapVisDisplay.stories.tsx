import { Annotation, DefaultInteractions, HeatmapVis } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared/vis-utils';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import ndarray from 'ndarray';

import HeatmapVisStoriesMeta from './HeatmapVis.stories';

const { dataArray } = HeatmapVisStoriesMeta.args;
const dataArrayNoSym = ndarray(
  dataArray.data.map((val, index) => (index % 41 >= 20 ? val * 5 : val)),
  dataArray.shape,
);

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
    aspect: 0.25,
  },
} satisfies Story;

export const FlipXAxis = {
  args: {
    dataArray: dataArrayNoSym,
    flipXAxis: true,
  },
} satisfies Story;

export const FlipYAxis = {
  args: {
    dataArray: dataArrayNoSym,
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
