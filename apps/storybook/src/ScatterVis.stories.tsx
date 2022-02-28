import { getDomain, INTERPOLATORS, ScatterVis } from '@h5web/lib';
import type { ScatterVisProps } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const Template: Story<ScatterVisProps> = (args) => <ScatterVis {...args} />;
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
  0.13, 0.04, 0.05, 0.14, 0.17, 0.2, 0.12, 0.06, 0.15, 0.19, 1, 1.08, 1.17,
  1.09, 1.15, 1.01, 1.04, 1.09, 1.18, 1.15, 2.18, 2.17, 2.08, 2.07, 2.08, 2.06,
  2.06, 2.04, 2.04, 2.06, 3.1, 3.06, 3.18, 3, 3.01, 3.18, 3.12, 3.06, 3.19,
  3.15, 4.14, 4.18, 4.11, 4.02, 4.16, 4.05, 4.02, 4.01, 4.18, 4.11, 5.16, 5.05,
  5.15, 5.16, 5.14, 5.09, 5.09, 5.15, 5.19, 5.11, 6.02, 6.04, 6.04, 6.12, 6.2,
  6.17, 6.01, 6.05, 6.18, 6.12, 7.18, 7, 7.12, 7.1, 7.18, 7.01, 7.16, 7.17, 7.1,
  7.02, 8.12, 8.1, 8.13, 8.19, 8.16, 8.03, 8.13, 8.17, 8.15, 8.18, 9.16, 9.12,
  9.1, 9.17, 9.12, 9.05, 9.08, 9.17, 9.02, 9.13,
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

const domain = getDomain(data);
const dataArray = ndarray(data);

export const Default = Template.bind({});
Default.args = {
  dataAbscissas: abscissas,
  dataOrdinates: ordinates.map((v) => v + 10),
  dataArray,
  domain,
};

export const TypedArray = Template.bind({});
TypedArray.args = {
  dataAbscissas: abscissas,
  dataOrdinates: ordinates.map((v) => v + 10),
  dataArray: ndarray(Float32Array.from(data)),
  domain,
};

export const MarkerSize = Template.bind({});
MarkerSize.args = {
  ...Default.args,
  size: 20,
};

export const Labels = Template.bind({});
Labels.args = {
  ...Default.args,
  title: 'A Scatter vis',
  abscissaLabel: 'Latitude',
  ordinateLabel: 'Longitude',
};

export default {
  title: 'Visualizations/ScatterVis',
  component: ScatterVis,
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  decorators: [FillHeight],
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
} as Meta;
