import type { DataCurveProps } from '@h5web/lib';
import { SelectionRect } from '@h5web/lib';
import { CurveType, DataCurve, useDomain, VisCanvas } from '@h5web/lib';
import { assertDefined, mockValues } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { useState } from 'react';
import { Vector2 } from 'three';

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

export const Glyphs = Template.bind({});
Glyphs.args = {
  curveType: CurveType.GlyphsOnly,
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  showErrors: true,
};

export const Interactive: Story<DataCurveProps> = (args) => {
  const [index, setIndex] = useState<number>();
  const [hoveredIndex, setHoveredIndex] = useState<number>();
  const { abscissas, ordinates } = args;

  const abscissaDomain = useDomain(abscissas);
  const ordinateDomain = useDomain(ordinates);
  assertDefined(abscissaDomain);
  assertDefined(ordinateDomain);

  const segmentBegin =
    hoveredIndex !== undefined
      ? new Vector2(abscissas[hoveredIndex], ordinates[hoveredIndex])
      : undefined;
  const segmentEnd =
    hoveredIndex !== undefined
      ? new Vector2(abscissas[hoveredIndex + 1], ordinates[hoveredIndex + 1])
      : undefined;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
      ordinateConfig={{ visDomain: ordinateDomain, showGrid: true }}
      title={
        index !== undefined
          ? `You clicked on segment ${index} going from (${abscissas[index]}, ${
              ordinates[index]
            }) to (${abscissas[index + 1]}, ${ordinates[index + 1]})`
          : 'Click on the curve!'
      }
    >
      <DataCurve
        {...args}
        onLineClick={(i) => setIndex(i)}
        onLinePointerEnter={(i) => setHoveredIndex(i)}
        onLinePointerOut={() => setHoveredIndex(undefined)}
      />
      {segmentBegin && segmentEnd && (
        <SelectionRect startPoint={segmentBegin} endPoint={segmentEnd} />
      )}
    </VisCanvas>
  );
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
