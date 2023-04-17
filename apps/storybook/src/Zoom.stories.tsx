import type { ZoomProps } from '@h5web/lib';
import { Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const Template: Story<ZoomProps> = (args) => {
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
};

export const Default = Template.bind({});

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  modifierKey: ['Control'],
};

export const MultipleModifierKeys = Template.bind({});
MultipleModifierKeys.args = {
  modifierKey: ['Control', 'Shift', 'Alt'],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export default {
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
} as Meta<ZoomProps>;
