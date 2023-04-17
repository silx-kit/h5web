import { getMockDataArray, ScaleType } from '@h5web/lib';
import type { Meta } from '@storybook/react/types-6-0';

import LineVisStoriesConfig, { LineVisTemplate } from './LineVis.stories';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const dataArrayForXLog = getMockDataArray('/nexus_entry/log_spectrum/X_log');

export const SymLogForY = LineVisTemplate.bind({});
SymLogForY.storyName = 'Symlog for Y';
SymLogForY.args = {
  dataArray,
  scaleType: ScaleType.SymLog,
};

export const LogForY = LineVisTemplate.bind({});
LogForY.storyName = 'Log for Y';
LogForY.args = {
  dataArray,
  scaleType: ScaleType.Log,
};

export const SymLogForX = LineVisTemplate.bind({});
SymLogForX.storyName = 'Symlog for X';
SymLogForX.args = {
  dataArray: dataArrayForXLog,
  scaleType: ScaleType.SymLog,
};

export const LogForX = LineVisTemplate.bind({});
LogForX.storyName = 'Log for X';
LogForX.args = {
  dataArray: dataArrayForXLog,
  abscissaParams: { scaleType: ScaleType.Log },
};

export const LogLog = LineVisTemplate.bind({});
LogLog.args = {
  dataArray: dataArrayForXLog,
  scaleType: ScaleType.Log,
  abscissaParams: { scaleType: ScaleType.Log },
};

export default {
  ...LineVisStoriesConfig,
  title: 'Visualizations/LineVis/Scales',
} as Meta;
