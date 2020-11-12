import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import { ScaleType } from '../h5web/visualizations/shared/models';
import LineVis, { LineVisProps } from '../h5web/visualizations/line/LineVis';
import { getDomain, mockValues } from '../packages/lib';
import { getMockDatasetDims } from '../h5web/providers/mock/utils';
import LineVisStoriesConfig from './LineVis.stories';

// Prepare 1D data array
const values = mockValues.oneD_linear;
const dataArray = ndarray(values, getMockDatasetDims('oneD_linear'));
const domain = getDomain(values);
const logSafeDomain = getDomain(values, ScaleType.Log);

const valuesForXLog = mockValues.X_log;
const dataArrayForXLog = ndarray(valuesForXLog, getMockDatasetDims('X_log'));
const domainForXLog = getDomain(valuesForXLog);

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
