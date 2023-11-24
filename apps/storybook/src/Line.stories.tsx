import { DefaultInteractions, Line, useDomain, VisCanvas } from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { mockValues } from '@h5web/shared/mock/values';
import { ScaleType } from '@h5web/shared/models-vis';
import type { Meta, StoryObj } from '@storybook/react';
import { range } from 'lodash';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Line',
  component: Line,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    abscissas: range(0, mockValues.oneD.length),
    ordinates: mockValues.oneD,
    color: 'blue',
    visible: true,
  },
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    color: { control: { type: 'color' } },
  },
} satisfies Meta<typeof Line>;

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
        <Line {...args} />
      </VisCanvas>
    );
  },
} satisfies Story;

export const Color = {
  ...Default,
  args: {
    color: 'purple',
  },
} satisfies Story;

export const IgnoreValue = {
  ...Default,
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
} satisfies Story;
