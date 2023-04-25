import { Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Interactions/Zoom',
  component: Zoom,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
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
} satisfies Meta<typeof Zoom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan />
        <Zoom {...args} />
        <ResetZoomButton />
      </VisCanvas>
    );
  },
} satisfies Story;

export const ModifierKey = {
  ...Default,
  args: {
    modifierKey: ['Control'],
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
