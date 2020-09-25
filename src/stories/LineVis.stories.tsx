import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import FillHeight from '../../.storybook/decorators/FillHeight';
import mockData from '../h5web/providers/mock/data.json';
import { findDomain } from '../h5web/visualizations/shared/utils';
import { ScaleType } from '../h5web/visualizations/shared/models';
import LineVis, { LineVisProps } from '../h5web/visualizations/line/LineVis';
import { CurveType } from '../h5web/visualizations/line/models';

const oneDimDataset = mockData.datasets['c8f60c27-aae2-11ea-84a9-b94ddd2ec9e8'];
const values = oneDimDataset.value as number[];

const dataArray = ndarray<number>(values, oneDimDataset.shape.dims);
const domain = findDomain(values);

const Template: Story<LineVisProps> = (args): ReactElement => (
  <LineVis {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});

Domain.args = {
  dataArray,
  domain: [-100, 100],
};

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

export const LogScale = Template.bind({});

LogScale.args = {
  dataArray,
  domain,
  scaleType: ScaleType.Log,
};

export const SymLogScale = Template.bind({});

SymLogScale.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export default {
  title: 'Visualizations/LineVis',
  component: LineVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // To keep mandatory args above optional ones.
    domain: {},
    curveType: {
      defaultValue: CurveType.LineOnly,
      control: {
        type: 'inline-radio',
        options: [
          CurveType.LineOnly,
          CurveType.GlyphsOnly,
          CurveType.LineAndGlyphs,
        ],
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
    showGrid: {
      defaultValue: true,
    },
  },
};
