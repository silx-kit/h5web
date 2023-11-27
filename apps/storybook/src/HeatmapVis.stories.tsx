import {
  getDomain,
  getMockDataArray,
  HeatmapVis,
  INTERPOLATORS,
  ScaleType,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { COLOR_SCALE_TYPES, toTypedNdArray } from '@h5web/shared/utils';
import type { Meta, StoryObj } from '@storybook/react';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const alphaArray = ndarray(
  dataArray.data.map((x) => Math.abs(x)),
  dataArray.shape,
);
const alphaDomain = getDomain(alphaArray);
assertDefined(alphaDomain);

const meta = {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    dataArray,
    domain,
    colorMap: 'Viridis',
    scaleType: ScaleType.Linear,
    aspect: 'equal',
    showGrid: true,
  },
  argTypes: {
    dataArray: { control: false },
    colorMap: {
      control: { type: 'select' },
      options: Object.keys(INTERPOLATORS),
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    aspect: {
      control: { type: 'inline-radio' },
      options: ['auto', 'equal', 0.25],
    },
  },
} satisfies Meta<typeof HeatmapVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Domain = {
  args: {
    domain: [-400, 400],
  },
} satisfies Story;

export const ColorMap = {
  args: {
    colorMap: 'Rainbow',
  },
} satisfies Story;

export const InvertColorMap = {
  args: {
    ...ColorMap.args,
    invertColorMap: true,
  },
} satisfies Story;

export const AxisValues = {
  args: {
    abscissaParams: {
      value: Array.from(
        { length: dataArray.shape[1] }, // works even when right edge of last pixel is not provided
        (_, i) => 100 + 10 * i,
      ),
    },
    ordinateParams: {
      value: Array.from(
        { length: dataArray.shape[0] + 1 },
        (_, i) => -100 + 10 * i,
      ),
    },
  },
} satisfies Story;

export const DescendingAxisValues = {
  args: {
    abscissaParams: {
      value: Array.from(
        { length: dataArray.shape[1] }, // works even when right edge of last pixel is not provided
        (_, i) => -100 - 10 * i,
      ),
    },
    ordinateParams: {
      value: Array.from(
        { length: dataArray.shape[0] + 1 },
        (_, i) => -100 - 10 * i,
      ),
    },
  },
} satisfies Story;

export const Alpha = {
  args: {
    alpha: {
      array: alphaArray,
      domain: alphaDomain,
    },
  },
} satisfies Story;

export const IgnoreValue = {
  args: {
    ignoreValue: (val) => val >= 0 && val <= 100,
  },
} satisfies Story;

export const TypedArray = {
  args: {
    dataArray: toTypedNdArray(dataArray, Float32Array),
    alpha: {
      array: toTypedNdArray(alphaArray, Float32Array),
      domain: alphaDomain,
    },
  },
} satisfies Story;

export const ChangeInteractionKeys = {
  args: {
    interactions: {
      xAxisZoom: false,
      yAxisZoom: false,
      selectToZoom: {
        modifierKey: 'Shift',
      },
    },
  },
} satisfies Story;
