import { getDomain, INTERPOLATORS, ScatterVis } from '@h5web/lib';
import { assertDefined, ScaleType } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';
import ndarray from 'ndarray';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';

const abscissas = [
  0.14, 1.01, 2.14, 3.14, 4.05, 5.17, 6.15, 7.09, 8.13, 9.16, 0.11, 1.18, 2.04,
  3.13, 4.07, 5.17, 6.18, 7.07, 8.05, 9.09, 0.08, 1.03, 2.01, 3.05, 4.03, 5.16,
  6.19, 7.18, 8.06, 9.03, 0.05, 1.04, 2.14, 3.13, 4.17, 5.11, 6.19, 7.06, 8.16,
  9.01, 0.03, 1.08, 2.16, 3.17, 4.13, 5.06, 6.12, 7.18, 8, 9.18, 0.15, 1.08,
  2.11, 3.15, 4.02, 5.07, 6.15, 7.19, 8.05, 9.18, 0.05, 1.04, 2.14, 3.11, 4.09,
  5, 6.09, 7.01, 8.04, 9.16, 0.13, 1.09, 2.03, 3.18, 4.17, 5.13, 6.15, 7.06,
  8.1, 9.1, 0.18, 1.11, 2.08, 3.18, 4.09, 5.03, 6.1, 7, 8.16, 9.13, 0.12, 1.03,
  2.04, 3.2, 4.02, 5.1, 6.09, 7.05, 8.15, 9.02,
];
const ordinates = [
  10.13, 10.04, 10.05, 10.14, 10.17, 10.2, 10.12, 10.06, 10.15, 10.19, 11,
  11.08, 11.17, 11.09, 11.15, 11.01, 11.04, 11.09, 11.18, 11.15, 12.18, 12.17,
  12.08, 12.07, 12.08, 12.06, 12.06, 12.04, 12.04, 12.06, 13.1, 13.06, 13.18,
  13, 13.01, 13.18, 13.12, 13.06, 13.19, 13.15, 14.14, 14.18, 14.11, 14.02,
  14.16, 14.05, 14.02, 14.01, 14.18, 14.11, 15.16, 15.05, 15.15, 15.16, 15.14,
  15.09, 15.09, 15.15, 15.19, 15.11, 16.02, 16.04, 16.04, 16.12, 16.2, 16.17,
  16.01, 16.05, 16.18, 16.12, 17.18, 17, 17.12, 17.1, 17.18, 17.01, 17.16,
  17.17, 17.1, 17.02, 18.12, 18.1, 18.13, 18.19, 18.16, 18.03, 18.13, 18.17,
  18.15, 18.18, 19.16, 19.12, 19.1, 19.17, 19.12, 19.05, 19.08, 19.17, 19.02,
  19.13,
];
const data = [
  0.01, 1.03, 4.78, 9.06, 17.58, 25.97, 36.61, 50.44, 64.79, 83.98, 1.43, 2.46,
  5.33, 10.97, 18.52, 27.12, 37.39, 52.39, 67.99, 84.49, 4.68, 5.74, 8.59,
  13.84, 21.71, 29.37, 40.31, 54.92, 70, 86.98, 9.63, 11.29, 14.14, 19.64,
  26.47, 34.99, 47.01, 61.43, 74.42, 90.6, 16.61, 18.05, 21.56, 26.7, 34.08,
  43.13, 54.69, 67.32, 83.45, 101.19, 26.21, 26.53, 31.62, 36.81, 42.41, 51.38,
  63.46, 76.33, 92.52, 106.57, 38.12, 37.6, 42.41, 45.32, 53.14, 64.27, 74.75,
  88.68, 101.83, 120.82, 49.04, 51.38, 55.77, 59.32, 67.55, 76.38, 88.3, 100.21,
  117.52, 135.74, 64.74, 67.5, 71.01, 73.97, 82.56, 92.17, 102.64, 116.02,
  130.98, 148.38, 84.4, 83.03, 87.54, 92.59, 101.36, 107.77, 121.98, 133.9,
  148.88, 167.67,
];

const dataArray = ndarray(data);
const domain = getDomain(data);
assertDefined(domain);

const meta = {
  title: 'Visualizations/ScatterVis',
  component: ScatterVis,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    colorMap: 'Viridis',
    showGrid: true,
  },
  argTypes: {
    colorMap: {
      control: { type: 'select' },
      options: Object.keys(INTERPOLATORS),
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: [
        ScaleType.Linear,
        ScaleType.Log,
        ScaleType.SymLog,
        ScaleType.Sqrt,
      ],
    },
  },
} satisfies Meta<typeof ScatterVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  args: {
    abscissaParams: { value: abscissas },
    ordinateParams: { value: ordinates },
    dataArray,
    domain,
  },
} satisfies Story;

export const TypedArray = {
  args: {
    ...Default.args,
    dataArray: ndarray(Float32Array.from(data)),
  },
} satisfies Story;

export const MarkerSize = {
  args: {
    ...Default.args,
    size: 20,
  },
} satisfies Story;

export const ColorMap = {
  args: {
    ...Default.args,
    colorMap: 'Rainbow',
  },
} satisfies Story;

export const ColorScaleType = {
  args: {
    ...Default.args,
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const Labels = {
  args: {
    ...Default.args,
    abscissaParams: { value: abscissas, label: 'Latitude' },
    ordinateParams: { value: ordinates, label: 'Longitude' },
    title: 'A Scatter vis',
  },
} satisfies Story;

export const AxisScaleTypes = {
  args: {
    ...Default.args,
    abscissaParams: { value: abscissas, scaleType: ScaleType.SymLog },
    ordinateParams: { value: ordinates, scaleType: ScaleType.Log },
  },
} satisfies Story;

export const Click = {
  ...Default,
  render: function ClickTemplate(args) {
    const [index, setIndex] = useState<number>();

    return (
      <ScatterVis
        {...args}
        title={
          index !== undefined
            ? `You clicked on point ${index} (value: ${data[index]})`
            : `Click on a point!`
        }
        onPointClick={(i) => setIndex(i)}
      />
    );
  },
} satisfies Story;
