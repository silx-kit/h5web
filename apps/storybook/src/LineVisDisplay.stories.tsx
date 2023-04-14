import {
  Annotation,
  CurveType,
  getDomain,
  getMockDataArray,
  LineVis,
  type LineVisProps,
} from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import { type Meta, type Story } from '@storybook/react/types-6-0';

import LineVisStoriesConfig, { LineVisTemplate } from './LineVis.stories';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data);

export const Glyphs = LineVisTemplate.bind({});
Glyphs.args = {
  dataArray,
  domain,
  curveType: CurveType.GlyphsOnly,
};

export const LineAndGlyphs = LineVisTemplate.bind({});
LineAndGlyphs.storyName = 'Line & Glyphs';
LineAndGlyphs.args = {
  dataArray,
  domain,
  curveType: CurveType.LineAndGlyphs,
};

export const NoGrid = LineVisTemplate.bind({});
NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const CustomTooltip = LineVisTemplate.bind({});
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

export const WithTitle = LineVisTemplate.bind({});
WithTitle.args = {
  dataArray,
  domain,
  title: 'A simple curve',
};

export const WithAxisLabels = LineVisTemplate.bind({});
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
