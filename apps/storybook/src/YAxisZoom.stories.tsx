import { Pan, ResetZoomButton, VisCanvas, YAxisZoom } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Interactions/YAxisZoom',
  component: YAxisZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    modifierKey: [],
    disabled: false,
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} satisfies Meta<typeof YAxisZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
    >
      <Pan />
      <YAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
} satisfies Story;

export const ModifierKey = {
  ...Default,
  args: {
    modifierKey: ['Shift'],
  },
} satisfies Story;

export const MultipleModifierKeys = {
  ...Default,
  args: {
    modifierKey: ['Control', 'Shift'],
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    disabled: true,
  },
} satisfies Story;

export const DisabledInsideEqualAspectCanvas = {
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="equal"
    >
      <Pan />
      <YAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
} satisfies Story;
