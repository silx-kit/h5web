import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import FillHeight from '../../.storybook/decorators/FillHeight';
import { ScaleType } from '../h5web/visualizations/shared/models';
import LineVis, { LineVisProps } from '../h5web/visualizations/line/LineVis';
import { CurveType } from '../h5web/visualizations/line/models';
import { getDomain } from '../packages/lib';
import { getMockDataArray } from '../h5web/providers/mock/utils';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data as number[]);

const errorsArray = ndarray(
  new Array(dataArray.size).fill(0).map((_, i) => Math.abs(10 - 0.5 * i)),
  dataArray.shape
);

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

export const ErrorBars = Template.bind({});

ErrorBars.args = {
  dataArray,
  domain: [-31, 31], // Extend domain to fit error bars
  errorsArray,
};

const LineVisStoriesConfig = {
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

export default LineVisStoriesConfig;
