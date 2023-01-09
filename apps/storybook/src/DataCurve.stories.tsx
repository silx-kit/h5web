import type { DataCurveProps } from '@h5web/lib';
import {
  Annotation,
  CurveType,
  DataCurve,
  GlyphType,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined, mockValues } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';

const Template: Story<DataCurveProps> = (args) => {
  const { abscissas, ordinates } = args;

  const abscissaDomain = useDomain(abscissas);
  const ordinateDomain = useDomain(ordinates);
  assertDefined(abscissaDomain);
  assertDefined(ordinateDomain);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
      ordinateConfig={{ visDomain: ordinateDomain, showGrid: true }}
    >
      <DataCurve {...args} />
    </VisCanvas>
  );
};

export const Default = Template.bind({});

export const Color = Template.bind({});
Color.args = {
  color: 'black',
};

export const DashedLine = Template.bind({});
DashedLine.args = {
  dashSize: 5,
  gapSize: 5,
};

export const Glyphs = Template.bind({});
Glyphs.args = {
  curveType: CurveType.GlyphsOnly,
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  showErrors: true,
};

export const GlyphTypeStory = Template.bind({});
GlyphTypeStory.storyName = 'Glyph Type';
GlyphTypeStory.args = {
  curveType: CurveType.LineAndGlyphs,
  glyphType: GlyphType.Circle,
};

export const GlyphSize = Template.bind({});
GlyphSize.args = {
  curveType: CurveType.LineAndGlyphs,
  glyphSize: 10,
};

export const Interactive: Story<DataCurveProps> = (args) => {
  const [index, setIndex] = useState<number>();
  const [hoveredIndex, setHoveredIndex] = useState<number>();
  const { abscissas, ordinates, color } = args;

  const abscissaDomain = useDomain(abscissas);
  const ordinateDomain = useDomain(ordinates);
  assertDefined(abscissaDomain);
  assertDefined(ordinateDomain);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
      ordinateConfig={{ visDomain: ordinateDomain, showGrid: true }}
      title={
        index !== undefined
          ? `You clicked on point ${index} at (${abscissas[index]}, ${ordinates[index]})!`
          : 'Click on a point!'
      }
      raycasterThreshold={6}
    >
      <DataCurve
        {...args}
        onDataPointClick={(i) => setIndex(i)}
        onDataPointEnter={(i) => setHoveredIndex(i)}
        onDataPointLeave={() => setHoveredIndex(undefined)}
      />
      {hoveredIndex && (
        <Annotation
          x={abscissas[hoveredIndex]}
          y={ordinates[hoveredIndex]}
          center
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'visible',
              width: '100%',
              height: '100%',
              fill: color,
            }}
          >
            <circle r={6} />
          </svg>
        </Annotation>
      )}
    </VisCanvas>
  );
};
Interactive.args = {
  curveType: CurveType.LineAndGlyphs,
  glyphType: GlyphType.Circle,
};

export default {
  title: 'Building Blocks/DataCurve',
  component: DataCurve,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: {
      sort: 'requiredFirst',
      exclude: ['abscissas', 'ordinates', 'errors'],
    },
  },
  args: {
    abscissas: range(0, mockValues.oneD.length),
    ordinates: mockValues.oneD,
    curveType: CurveType.LineOnly,
    color: 'blue',
    visible: true,
  },
  argTypes: {
    color: { control: { type: 'color' } },
  },
} as Meta<DataCurveProps>;
