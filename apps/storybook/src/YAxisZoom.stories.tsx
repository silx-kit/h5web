import {
  Pan,
  ResetZoomButton,
  VisCanvas,
  YAxisZoom,
  type YAxisZoomProps,
} from '@h5web/lib';
import { type Meta, type Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const Template: Story<YAxisZoomProps> = (args) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
    >
      <Pan />
      <YAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export const Default = Template.bind({});

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  modifierKey: ['Shift'],
};

export const MultipleModifierKeys = Template.bind({});
MultipleModifierKeys.args = {
  modifierKey: ['Control', 'Shift'],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledInsideEqualAspectCanvas: Story<YAxisZoomProps> = (
  args
) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="equal"
    >
      <YAxisZoom {...args} />
    </VisCanvas>
  );
};

export default {
  title: 'Building Blocks/Interactions/YAxisZoom',
  component: YAxisZoom,
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
} as Meta<YAxisZoomProps>;
