import {
  Annotation,
  CurveType,
  DataCurve,
  DefaultInteractions,
  GlyphType as GlyphTypeEnum,
  mockValues,
  ScaleType,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { range } from 'd3-array';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();

const meta = {
  title: 'Building Blocks/DataCurve',
  component: DataCurve,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    errors: oneD.data.map(() => 10),
    curveType: CurveType.LineOnly,
    color: 'blue',
    materialProps: {},
    visible: true,
  },
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    errors: { control: false },
    color: { control: { type: 'color' } },
    materialProps: {
      control: 'object',
      description: 'Properties passed to the underlying Three.js material.',
    },
  },
} satisfies Meta<typeof DataCurve>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { abscissas, ordinates, errors, showErrors, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(
      ordinates,
      ScaleType.Linear,
      showErrors ? errors : undefined,
      ignoreValue,
    );

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
} satisfies Story;

export const Color = {
  ...Default,
  args: {
    color: 'black',
  },
} satisfies Story;

export const Glyphs = {
  ...Default,
  args: {
    curveType: CurveType.GlyphsOnly,
  },
} satisfies Story;

export const WithErrors = {
  ...Default,
  args: {
    showErrors: true,
  },
} satisfies Story;

export const GlyphType = {
  ...Default,
  args: {
    curveType: CurveType.LineAndGlyphs,
    glyphType: GlyphTypeEnum.Circle,
  },
} satisfies Story;

export const GlyphSize = {
  ...Default,
  args: {
    curveType: CurveType.LineAndGlyphs,
    glyphSize: 10,
  },
} satisfies Story;

export const IgnoreValue = {
  ...Default,
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
} satisfies Story;

export const Interactive = {
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
        raycasterThreshold={6}
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
              <circle r={6} />
            </svg>
          </Annotation>
        )}
      </VisCanvas>
    );
  },
  args: {
    curveType: CurveType.LineAndGlyphs,
    glyphType: GlyphTypeEnum.Circle,
  },
} satisfies Story;
