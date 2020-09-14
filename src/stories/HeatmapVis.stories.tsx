import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import FillHeight from '../../.storybook/decorators/FillHeight';
import HeatmapVis, {
  HeatmapVisProps,
} from '../h5web/visualizations/heatmap/HeatmapVis';
import mockData from '../h5web/providers/mock/data.json';

const dataset1 = mockData.datasets['c8f60c29-aae2-11ea-84a9-b94ddd2ec9e8'];

const Template: Story<HeatmapVisProps> = (args): ReactElement => (
  <HeatmapVis {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataArray: ndarray<number>(
    dataset1.value.flat(Infinity) as number[],
    dataset1.shape.dims
  ).transpose(1, 0), // makes for a nicer-looking heatmap
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
};
