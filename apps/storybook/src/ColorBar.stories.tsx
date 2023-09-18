import type { ColorBarProps } from '@h5web/lib';
import { ColorBar, ScaleType } from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

export interface StoryProps extends ColorBarProps {
  domainMin: number;
  domainMax: number;
}

const meta = {
  title: 'Building Blocks/ColorBar',
  component: ColorBar,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ display: 'grid', padding: '0 2rem 0.75rem' }}>
        <Story />
      </div>
    ),
    FillHeight,
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    domain: { control: false },
    domainMin: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    domainMax: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<StoryProps>;

export const Default = {
  render: (args) => {
    const { domainMin: min, domainMax: max, ...colorBarArgs } = args;
    return <ColorBar {...colorBarArgs} domain={[min, max]} />;
  },
  args: {
    domainMin: 0.1,
    domainMax: 1,
    scaleType: ScaleType.Linear,
    colorMap: 'Viridis',
  },
} satisfies Story;

export const InvertColorMap = {
  ...Default,
  args: {
    ...Default.args,
    invertColorMap: true,
  },
} satisfies Story;

export const ColorMap = {
  ...Default,
  args: {
    ...Default.args,
    colorMap: 'Blues',
  },
} satisfies Story;

export const WithBounds = {
  ...Default,
  args: {
    ...Default.args,
    domainMin: -235.111,
    domainMax: 98765,
    withBounds: true,
  },
} satisfies Story;

export const LogScale = {
  ...Default,
  args: {
    ...Default.args,
    scaleType: ScaleType.Log,
  },
} satisfies Story;

export const NegativeLogScale = {
  ...Default,
  name: 'Log Scale with negative domain',
  args: {
    ...Default.args,
    scaleType: ScaleType.Log,
    domainMin: -10,
    domainMax: -1,
  },
} satisfies Story;

export const SymLogScale = {
  ...Default,
  args: {
    ...Default.args,
    scaleType: ScaleType.SymLog,
    domainMin: -6,
    domainMax: 6,
  },
} satisfies Story;

export const EmptyDomain = {
  ...Default,
  args: {
    ...Default.args,
    domainMin: 0,
    domainMax: 0,
    withBounds: true,
  },
} satisfies Story;
