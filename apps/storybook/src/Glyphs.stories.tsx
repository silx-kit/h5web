import {
  DefaultInteractions,
  Glyphs,
  GlyphType as GlyphTypeEnum,
  mockValues,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { range } from 'd3-array';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();

const meta = preview.meta({
  title: 'Building Blocks/Glyphs',
  component: Glyphs,
  decorators: [FillHeight],
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    glyphType: {
      control: { type: 'select' },
      options: Object.keys(GlyphTypeEnum),
    },
    color: { control: { type: 'color' } },
  },
});

export const Default = meta.story({
  render: (args) => {
    const { abscissas, ordinates, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(ordinates, { ignoreValue });

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
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    color: 'blue',
  },
});

export const Color = Default.extend({
  args: {
    color: 'red',
  },
});

export const GlyphType = Default.extend({
  args: {
    glyphType: GlyphTypeEnum.Square,
  },
});

export const Size = Default.extend({
  args: {
    size: 12,
  },
});

export const IgnoreValue = Default.extend({
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
});
