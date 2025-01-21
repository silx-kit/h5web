import {
  DefaultInteractions,
  Glyphs,
  GlyphType as GlyphTypeEnum,
  mockValues,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { ScaleType } from '@h5web/shared/vis-models';
import { type Meta, type StoryObj } from '@storybook/react';
import { range } from 'd3-array';

import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();

const meta = {
  title: 'Building Blocks/Glyphs',
  component: Glyphs,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    glyphType: GlyphTypeEnum.Cross,
    color: 'blue',
    size: 6,
    visible: true,
  },
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    glyphType: {
      control: { type: 'select' },
      options: Object.keys(GlyphTypeEnum),
    },
    color: { control: { type: 'color' } },
  },
} satisfies Meta<typeof Glyphs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { abscissas, ordinates, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(
      ordinates,
      ScaleType.Linear,
      undefined,
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
        <Glyphs {...args} />
      </VisCanvas>
    );
  },
} satisfies Story;

export const Color = {
  ...Default,
  args: {
    color: 'red',
  },
} satisfies Story;

export const GlyphType = {
  ...Default,
  args: {
    glyphType: GlyphTypeEnum.Square,
  },
} satisfies Story;

export const Size = {
  ...Default,
  args: {
    size: 12,
  },
} satisfies Story;

export const IgnoreValue = {
  ...Default,
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
} satisfies Story;
