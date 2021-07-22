import type { Meta, Story } from '@storybook/react/types-6-0';
import HeatmapVisStoriesConfig from './HeatmapVis.stories';
import {
  HeatmapVis,
  HeatmapVisProps,
  getDomain,
  getMockDataArray,
  Annotation,
} from '../packages/lib';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const Template: Story<HeatmapVisProps> = (args) => <HeatmapVis {...args} />;

export const Fill = Template.bind({});
Fill.args = {
  dataArray,
  domain,
  layout: 'fill',
};

export const Contain = Template.bind({});
Contain.args = {
  dataArray,
  domain,
  layout: 'contain',
};

export const FlipYAxis = Template.bind({});
FlipYAxis.args = {
  dataArray,
  domain,
  flipYAxis: true,
};

export const NoGrid = Template.bind({});
NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const WheelCapture = Template.bind({});
WheelCapture.args = { dataArray, domain };
WheelCapture.decorators = [
  (VisCanvasStory: Story) => (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        <VisCanvasStory />
      </div>
      <div style={{ height: 500 }} />
    </>
  ),
];

export const WithTitle = Template.bind({});
WithTitle.args = {
  dataArray,
  domain,
  title: 'Pretty colors',
};

export const WithAxisLabels = Template.bind({});
WithAxisLabels.args = {
  dataArray,
  domain,
  abscissaParams: { label: 'Latitude' },
  ordinateParams: { label: 'Longitude' },
};

export const WithAnnotation: Story<HeatmapVisProps> = (args) => (
  <HeatmapVis {...args}>
    <Annotation x={30} y={18} style={{ width: '200px', color: 'white' }}>
      An annotation
    </Annotation>
  </HeatmapVis>
);

WithAnnotation.args = {
  dataArray,
  domain,
};

export default {
  ...HeatmapVisStoriesConfig,
  title: 'Visualizations/HeatmapVis/Display',
} as Meta;
