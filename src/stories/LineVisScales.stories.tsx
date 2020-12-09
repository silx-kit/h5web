import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import { ScaleType } from '../h5web/visualizations/shared/models';
import LineVis, { LineVisProps } from '../h5web/visualizations/line/LineVis';
import { getDomain } from '../packages/lib';
import { getMockDataArray } from '../h5web/providers/mock/utils';
import LineVisStoriesConfig from './LineVis.stories';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data as number[]);
const logSafeDomain = getDomain(dataArray.data as number[], ScaleType.Log);

const dataArrayForXLog = getMockDataArray('/nexus_entry/log_spectrum/X_log');
const domainForXLog = getDomain(dataArrayForXLog.data as number[]);

const Template: Story<LineVisProps> = (args): ReactElement => (
  <LineVis {...args} />
);

export const LogForY = Template.bind({});
LogForY.storyName = 'Log for Y';
LogForY.args = {
  dataArray,
  domain: logSafeDomain,
  scaleType: ScaleType.Log,
};

export const LogForNegativeY = Template.bind({});
LogForNegativeY.storyName = 'Log for negative Y';
LogForNegativeY.args = {
  dataArray,
  domain: [-20, -1],
  scaleType: ScaleType.Log,
};

export const SymLogForY = Template.bind({});
SymLogForY.storyName = 'Sym Log for Y';
SymLogForY.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const LogForX = Template.bind({});
LogForY.storyName = 'Log for X';
LogForX.args = {
  dataArray: dataArrayForXLog,
  domain: domainForXLog,
  abscissaParams: { scaleType: ScaleType.Log },
};

export const SymLogForX = Template.bind({});
LogForY.storyName = 'Sym Log for X';
SymLogForX.args = {
  dataArray: dataArrayForXLog,
  domain: domainForXLog,
  scaleType: ScaleType.SymLog,
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
};
