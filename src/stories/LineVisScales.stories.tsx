import type { Meta, Story } from '@storybook/react/types-6-0';
import LineVisStoriesConfig from './LineVis.stories';
import {
  LineVis,
  LineVisProps,
  ScaleType,
  getDomain,
  getMockDataArray,
} from '../packages/lib';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data);
const logSafeDomain = getDomain(dataArray.data, ScaleType.Log);

const dataArrayForXLog = getMockDataArray('/nexus_entry/log_spectrum/X_log');
const domainForXLog = getDomain(dataArrayForXLog.data);

const Template: Story<LineVisProps> = (args) => <LineVis {...args} />;

export const SymLogForY = Template.bind({});
SymLogForY.storyName = 'Symlog for Y';
SymLogForY.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const LogForY = Template.bind({});
LogForY.storyName = 'Log for Y';
LogForY.args = {
  dataArray,
  domain: logSafeDomain,
  scaleType: ScaleType.Log,
};

export const SymLogForX = Template.bind({});
SymLogForX.storyName = 'Symlog for X';
SymLogForX.args = {
  dataArray: dataArrayForXLog,
  domain: domainForXLog,
  scaleType: ScaleType.SymLog,
};

export const LogForX = Template.bind({});
LogForX.storyName = 'Log for X';
LogForX.args = {
  dataArray: dataArrayForXLog,
  domain: domainForXLog,
  abscissaParams: { scaleType: ScaleType.Log },
};

export const LogLog = Template.bind({});

LogLog.args = {
  dataArray: dataArrayForXLog,
  domain: domainForXLog,
  scaleType: ScaleType.Log,
  abscissaParams: { scaleType: ScaleType.Log },
};

export default {
  ...LineVisStoriesConfig,
  title: 'Visualizations/LineVis/Scales',
} as Meta;
