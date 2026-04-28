import {
  Annotation,
  CurveType,
  DataCurve,
  DefaultInteractions,
  GlyphType as GlyphTypeEnum,
  Interpolation,
  mockValues,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { range } from 'd3-array';
import { useState } from 'react';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();

const meta = preview.meta({
  title: 'Building Blocks/DataCurve',
  component: DataCurve,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    errors: { control: false },
    color: { control: { type: 'color' } },
    curveType: {
      control: { type: 'inline-radio' },
      options: ['OnlyLine', 'OnlyGlyphs', 'LineAndGlyphs', undefined],
    },
    interpolation: {
      control: { type: 'inline-radio' },
      options: ['Linear', 'Constant', undefined],
    },
    glyphType: {
      control: { type: 'inline-radio' },
      options: ['Circle', 'Cross', 'Square', 'Cap', undefined],
    },
    ignoreValue: { control: false },
    materialProps: {
      control: 'object',
      description: 'Properties passed to the underlying Three.js material.',
    },
  },
});

export const Default = meta.story({
  render: (args) => {
    const { abscissas, ordinates, errors, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(ordinates, {
      errors,
      ignoreValue,
    });

    assertDefined(abscissaDomain);
    assertDefined(ordinateDomain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
        ordinateConfig={{ visDomain: ordinateDomain, showGrid: true }}
      >
        <DefaultInteractions />
        <DataCurve {...args} />
      </VisCanvas>
    );
  },
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    color: 'blue',
  },
});

export const Color = Default.extend({
  args: {
    color: 'black',
  },
});

export const GlyphsOnly = Default.extend({
  args: {
    curveType: CurveType.GlyphsOnly,
  },
});

export const LineAndGlyphs = Default.extend({
  args: {
    curveType: CurveType.LineAndGlyphs,
  },
});

export const Width = Default.extend({
  args: {
    width: 3,
  },
});

export const ConstantInterpolation = Default.extend({
  args: {
    interpolation: Interpolation.Constant,
  },
});

export const ConstantWithWidth = Default.extend({
  args: {
    width: 3,
    interpolation: Interpolation.Constant,
  },
});

export const WithErrors = Default.extend({
  args: {
    errors: oneD.data.map(() => 10),
  },
});

export const GlyphType = Default.extend({
  args: {
    curveType: CurveType.GlyphsOnly,
    glyphType: GlyphTypeEnum.Square,
  },
});

export const GlyphSize = Default.extend({
  args: {
    curveType: CurveType.LineAndGlyphs,
    glyphSize: 10,
  },
});

export const IgnoreValue = Default.extend({
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
});

export const Interactive = meta.story({
  render: (args) => {
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
        raycasterThreshold={20}
      >
        <DefaultInteractions />
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
              <circle r={10} />
            </svg>
          </Annotation>
        )}
      </VisCanvas>
    );
  },
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    color: 'blue',
    curveType: CurveType.LineAndGlyphs,
    glyphSize: 10,
  },
});
