import {
  DefaultInteractions,
  Interpolation,
  Line,
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
  title: 'Building Blocks/Line',
  component: Line,
  decorators: [FillHeight],
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
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
        <Line {...args} />
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
    color: 'purple',
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

export const IgnoreValue = Default.extend({
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
});
