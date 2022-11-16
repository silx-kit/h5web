import type { HeatmapVisProps } from '@h5web/lib';
import {
  HeatmapVis,
  ScaleType,
  getDomain,
  getMockDataArray,
  INTERPOLATORS,
} from '@h5web/lib';
import { assertDefined, toTypedNdArray } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const alphaArray = ndarray(
  dataArray.data.map((x) => Math.abs(x)),
  dataArray.shape
);
const alphaDomain = getDomain(alphaArray);
assertDefined(alphaDomain);

const Template: Story<HeatmapVisProps> = (args) => <HeatmapVis {...args} />;

export const Default = Template.bind({});
Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});
Domain.args = {
  dataArray,
  domain: [-400, 400],
};

export const ColorMap = Template.bind({});
ColorMap.args = {
  dataArray,
  domain,
  colorMap: 'Rainbow',
};

export const InvertColorMap = Template.bind({});
InvertColorMap.args = {
  dataArray,
  domain,
  colorMap: 'Rainbow',
  invertColorMap: true,
};

export const AxisValues = Template.bind({});
AxisValues.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from(
      { length: dataArray.shape[1] }, // works even when right edge of last pixel is not provided
      (_, i) => 100 + 10 * i
    ),
  },
  ordinateParams: {
    value: Array.from(
      { length: dataArray.shape[0] + 1 },
      (_, i) => (-5 + 0.5 * i) / 100
    ),
  },
};

export const DescendingAxisValues = Template.bind({});
DescendingAxisValues.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from(
      { length: dataArray.shape[1] }, // works even when right edge of last pixel is not provided
      (_, i) => -100 - 10 * i
    ),
  },
  ordinateParams: {
    value: Array.from(
      { length: dataArray.shape[0] + 1 },
      (_, i) => (5 - 0.5 * i) / 100
    ),
  },
};

export const Alpha = Template.bind({});
Alpha.args = {
  dataArray,
  domain,
  alpha: { array: alphaArray, domain: alphaDomain },
};

export const TypedArray = Template.bind({});
TypedArray.args = {
  dataArray: toTypedNdArray(dataArray, Float32Array),
  domain,
  alpha: {
    array: toTypedNdArray(alphaArray, Float32Array),
    domain: alphaDomain,
  },
};

export const ChangeInteractionKeys = Template.bind({});
ChangeInteractionKeys.args = {
  dataArray,
  domain,
  interactions: {
    xAxisZoom: false,
    yAxisZoom: false,
    selectToZoom: { modifierKey: 'Shift' },
  },
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  decorators: [FillHeight],
  args: {
    colorMap: 'Viridis',
    scaleType: ScaleType.Linear,
    aspect: 'equal',
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
    aspect: {
      control: { type: 'inline-radio' },
      options: ['auto', 'equal'],
    },
  },
} as Meta;
