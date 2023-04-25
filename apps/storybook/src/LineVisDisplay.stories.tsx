import {
  Annotation,
  CurveType,
  getDomain,
  getMockDataArray,
  LineVis,
} from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';

import LineVisStoriesMeta, { Default } from './LineVis.stories';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray.data);

const meta = {
  ...LineVisStoriesMeta,
  title: 'Visualizations/LineVis/Display',
} satisfies Meta<typeof LineVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Glyphs = {
  ...Default,
  args: {
    curveType: CurveType.GlyphsOnly,
  },
} satisfies Story;

export const LineAndGlyphs = {
  ...Default,
  storyName: 'Line & Glyphs',
  args: {
    curveType: CurveType.LineAndGlyphs,
  },
} satisfies Story;

export const NoGrid = {
  ...Default,
  args: {
    showGrid: false,
  },
} satisfies Story;

export const CustomTooltip = {
  ...Default,
  args: {
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
  },
} satisfies Story;

export const WithTitle = {
  ...Default,
  args: {
    title: 'A simple curve',
  },
} satisfies Story;

export const WithAxisLabels = {
  ...Default,
  args: {
    abscissaParams: { label: 'Time' },
    ordinateLabel: 'Position',
  },
} satisfies Story;

export const WithAnnotation = {
  render: (args) => (
    <LineVis {...args}>
      <Annotation x={30} y={10} style={{ width: '100px' }}>
        a very simple line
      </Annotation>
    </LineVis>
  ),
  args: {
    domain,
  },
} satisfies Story;
