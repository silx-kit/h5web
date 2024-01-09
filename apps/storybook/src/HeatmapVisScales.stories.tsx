import type { HeatmapVisProps } from '@h5web/lib';
import { getDomain, HeatmapVis, mockValues, ScaleType } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import HeatmapVisStoriesMeta from './HeatmapVis.stories';

const dataArray = mockValues.twoD();
const domain = getDomain(dataArray.data);
const logSafeDomain = getDomain(dataArray.data, ScaleType.Log);
const sqrtSafeDomain = getDomain(dataArray.data, ScaleType.Sqrt);

const meta = {
  ...HeatmapVisStoriesMeta,
  title: 'Visualizations/HeatmapVis/Scales',
} satisfies Meta<typeof HeatmapVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SymLogScale = {
  name: 'Symlog Scale',
  args: {
    dataArray,
    domain,
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const LogScale = {
  args: {
    dataArray,
    domain: logSafeDomain,
    scaleType: ScaleType.Log,
  },
} satisfies Story;

export const SqrtScale = {
  name: 'Square Root Scale',
  args: {
    dataArray,
    domain: sqrtSafeDomain,
    scaleType: ScaleType.Sqrt,
  },
} satisfies Story;

export const GammaScale = {
  render: (args) => {
    const { gammaExponent, scaleType, ...otherArgs } = args;
    return (
      <HeatmapVis scaleType={[ScaleType.Gamma, gammaExponent]} {...otherArgs} />
    );
  },
  args: {
    gammaExponent: 0.4,
  },
  argTypes: {
    scaleType: { control: false },
    gammaExponent: { control: { type: 'range', min: 0, max: 10, step: 0.1 } },
  },
} satisfies StoryObj<HeatmapVisProps & { gammaExponent: number }>;
