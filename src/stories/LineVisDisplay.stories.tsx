import type { Meta, Story } from '@storybook/react/types-6-0';
import LineVisStoriesConfig from './LineVis.stories';
import {
  LineVis,
  LineVisProps,
  CurveType,
  getDomain,
  getMockDataArray,
  Annotation,
} from '../packages/lib';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data);

const Template: Story<LineVisProps> = (args) => <LineVis {...args} />;

export const Glyphs = Template.bind({});
Glyphs.args = {
  dataArray,
  domain,
  curveType: CurveType.GlyphsOnly,
};

export const LineAndGlyphs = Template.bind({});
LineAndGlyphs.storyName = 'Line & Glyphs';
LineAndGlyphs.args = {
  dataArray,
  domain,
  curveType: CurveType.LineAndGlyphs,
};

export const NoGrid = Template.bind({});
NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  dataArray,
  domain,
  title: 'A simple curve',
};

export const WithAxisLabels = Template.bind({});
WithAxisLabels.args = {
  dataArray,
  domain,
  abscissaParams: { label: 'Time' },
  ordinateLabel: 'Position',
};

export const WithAnnotation: Story<LineVisProps> = (args) => (
  <LineVis {...args}>
    <Annotation x={30} y={10} style={{ width: '100px' }}>
      a very simple line
    </Annotation>
  </LineVis>
);

WithAnnotation.args = {
  dataArray,
  domain,
};

export default {
  ...LineVisStoriesConfig,
  title: 'Visualizations/LineVis/Display',
} as Meta;
