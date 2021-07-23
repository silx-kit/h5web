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
import { formatTooltipVal } from '../h5web/utils';

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

export const CustomTooltip = Template.bind({});
CustomTooltip.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from({ length: dataArray.size }, (_, i) => -10 + 0.5 * i),
  },
  renderTooltip: (data) => {
    const { abscissa, xi, x } = data;
    return (
      <>
        <div>
          <strong>{`value = ${dataArray.get(xi)}`}</strong>
        </div>
        <div>{`abscissa = ${abscissa}`}</div>
        <div>{`xi = ${xi}`}</div>
        <div>{`x = ${formatTooltipVal(x)}`}</div>
      </>
    );
  },
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
