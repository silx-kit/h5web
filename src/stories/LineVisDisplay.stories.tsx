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
    value: Array.from({ length: dataArray.size }, (_, i) => -10 + 0.5 * i),
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
