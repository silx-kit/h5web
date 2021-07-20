import type { Meta, Story } from '@storybook/react/types-6-0';
import FillHeight from './decorators/FillHeight';
import {
  HeatmapVis,
  HeatmapVisProps,
  ScaleType,
  getDomain,
  getMockDataArray,
  INTERPOLATORS,
} from '../packages/lib';
import ndarray from 'ndarray';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const alphaArray = ndarray(dataArray.data.map((x) => Math.abs(x)));
const alphaDomain = getDomain(alphaArray);

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

export const Alpha = Template.bind({});
Alpha.args = {
  dataArray,
  domain,
  alphaArray,
  alphaDomain,
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // To keep mandatory args above optional ones.
    domain: {},
    colorMap: {
      defaultValue: 'Viridis',
      control: {
        type: 'select',
        options: Object.keys(INTERPOLATORS),
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [
          ScaleType.Linear,
          ScaleType.Log,
          ScaleType.SymLog,
          ScaleType.Sqrt,
        ],
      },
    },
    layout: {
      defaultValue: 'cover',
      control: {
        type: 'inline-radio',
        options: ['contain', 'cover', 'fill'],
      },
    },
    showGrid: {
      defaultValue: true,
    },
  },
} as Meta;
