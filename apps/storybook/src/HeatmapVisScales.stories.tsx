import {
  getDomain,
  HeatmapVis,
  type HeatmapVisProps,
  mockValues,
  ScaleType,
} from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import HeatmapVisStoriesMeta from './HeatmapVis.stories';

const twoD = mockValues.twoD();
const domain = getDomain(twoD.data);
const logSafeDomain = getDomain(twoD.data, ScaleType.Log);
const sqrtSafeDomain = getDomain(twoD.data, ScaleType.Sqrt);

const meta = {
  ...HeatmapVisStoriesMeta,
  title: 'Visualizations/HeatmapVis/Scales',
} satisfies Meta<typeof HeatmapVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SymLogScale = {
  name: 'Symlog Scale',
  args: {
    dataArray: twoD,
    domain,
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const LogScale = {
  args: {
    dataArray: twoD,
    domain: logSafeDomain,
    scaleType: ScaleType.Log,
  },
} satisfies Story;

export const SqrtScale = {
  name: 'Square Root Scale',
  args: {
    dataArray: twoD,
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
