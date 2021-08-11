import type { Meta, Story } from '@storybook/react/types-6-0';
import HeatmapVisStoriesConfig from './HeatmapVis.stories';
import {
  HeatmapVis,
  HeatmapVisProps,
  ScaleType,
  getDomain,
  getMockDataArray,
} from '../packages/lib';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);
const logSafeDomain = getDomain(dataArray.data, ScaleType.Log);
const sqrtSafeDomain = getDomain(dataArray.data, ScaleType.Sqrt);

const Template: Story<HeatmapVisProps> = (args) => <HeatmapVis {...args} />;

export const SymLogScale = Template.bind({});
SymLogScale.storyName = 'Symlog Scale';
SymLogScale.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const LogScale = Template.bind({});
LogScale.args = {
  dataArray,
  domain: logSafeDomain,
  scaleType: ScaleType.Log,
};

export const SqrtScale = Template.bind({});
SqrtScale.storyName = 'Square Root Scale';
SqrtScale.args = {
  dataArray,
  domain: sqrtSafeDomain,
  scaleType: ScaleType.Sqrt,
};

export const GammaScale: Story<
  HeatmapVisProps & {
    gammaExponent: number;
  }
> = (args) => {
  const { gammaExponent, scaleType, ...otherArgs } = args;

  return (
    <HeatmapVis scaleType={[ScaleType.Gamma, gammaExponent]} {...otherArgs} />
  );
};
GammaScale.args = {
  dataArray,
  domain,
  gammaExponent: 0.4,
};
GammaScale.argTypes = {
  scaleType: { control: false },
  gammaExponent: { control: { type: 'range', min: 0, max: 10, step: 0.1 } },
};

export default {
  ...HeatmapVisStoriesConfig,
  title: 'Visualizations/HeatmapVis/Scales',
} as Meta;
