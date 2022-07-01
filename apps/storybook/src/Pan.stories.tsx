import { MouseButton } from '@h5web/lib';
import { Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';
import type { PanProps } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const Template: Story<PanProps> = (args) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan {...args} />
      <Zoom />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export const Default = Template.bind({});

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  modifierKey: ['Shift'],
};

export const MultipleModifierKey = Template.bind({});
MultipleModifierKey.args = {
  modifierKey: ['Control', 'Shift'],
};

export const MiddleButton = Template.bind({});
MiddleButton.args = {
  button: [MouseButton.Middle],
};

export const TwoButtons = Template.bind({});
TwoButtons.args = {
  button: [MouseButton.Left, MouseButton.Middle],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export default {
  title: 'Building Blocks/Interactions/Pan',
  component: Pan,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  args: {
    button: [MouseButton.Left],
    modifierKey: [],
    disabled: false,
  },
  argTypes: {
    button: {
      control: {
        type: 'inline-check',
        labels: { [MouseButton.Left]: 'Left', [MouseButton.Middle]: 'Middle' },
      },
      options: [MouseButton.Left, MouseButton.Middle],
    },
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} as Meta<PanProps>;
