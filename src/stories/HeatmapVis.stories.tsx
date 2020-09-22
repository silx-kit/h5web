import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import FillHeight from '../../.storybook/decorators/FillHeight';
import HeatmapVis, {
  HeatmapVisProps,
} from '../h5web/visualizations/heatmap/HeatmapVis';
import mockData from '../h5web/providers/mock/data.json';
import { findDomain } from '../h5web/visualizations/shared/utils';
import { ScaleType } from '../h5web/visualizations/shared/models';
import { INTERPOLATORS } from '../h5web/visualizations/heatmap/interpolators';

// A 2D dataset
const dataset = mockData.datasets['c8f60c29-aae2-11ea-84a9-b94ddd2ec9e8'];
const values = dataset.value.flat(Infinity) as number[];

const dataArray = ndarray<number>(values, dataset.shape.dims).transpose(1, 0); // makes for a nicer-looking heatmap
const domain = findDomain(values);

const Template: Story<HeatmapVisProps> = (args): ReactElement => (
  <HeatmapVis {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});

Domain.args = {
  dataArray,
  domain: [-400, 400],
};

export const ColorMap = Template.bind({});

ColorMap.args = {
  dataArray,
  domain,
  colorMap: 'Rainbow',
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

export const AspectRatio = Template.bind({});

AspectRatio.args = {
  dataArray,
  domain,
  keepAspectRatio: false,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // To keep mandatory args above optional ones.
    domain: {},
    colorMap: {
      defaultValue: 'Viridis',
      control: {
        type: 'select',
        options: Object.keys(INTERPOLATORS),
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
    keepAspectRatio: {
      defaultValue: true,
    },
    showGrid: {
      defaultValue: true,
    },
  },
};
