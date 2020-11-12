import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import LineVis, { LineVisProps } from '../h5web/visualizations/line/LineVis';
import { CurveType } from '../h5web/visualizations/line/models';
import { getDomain, mockValues } from '../packages/lib';
import { getMockDatasetDims } from '../h5web/providers/mock/utils';
import LineVisStoriesConfig from './LineVis.stories';

// Prepare 1D data array
const values = mockValues.oneD_linear;
const dataArray = ndarray(values, getMockDatasetDims('oneD_linear'));
const domain = getDomain(values);

const Template: Story<LineVisProps> = (args): ReactElement => (
  <LineVis {...args} />
);

export const LineAndGlyphs = Template.bind({});

LineAndGlyphs.args = {
  dataArray,
  domain,
  curveType: CurveType.LineAndGlyphs,
};

export const GlyphsOnly = Template.bind({});

GlyphsOnly.args = {
  dataArray,
  domain,
  curveType: CurveType.GlyphsOnly,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const CustomAbscissas = Template.bind({});

CustomAbscissas.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: new Array(dataArray.size).fill(0).map((_, i) => -10 + 0.5 * i),
  },
};

export const WithAxesLabels = Template.bind({});

WithAxesLabels.args = {
  dataArray,
  domain,
  abscissaParams: { label: 'Time' },
  ordinateLabel: 'Position',
};

export const WithTitle = Template.bind({});

WithTitle.args = {
  dataArray,
  domain,
  title: 'A simple curve',
};

export default {
  ...LineVisStoriesConfig,
  title: 'Visualizations/LineVis/Display',
};
