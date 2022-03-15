import { Pan, ResetZoomButton, VisCanvas, YAxisZoom } from '@h5web/lib';
import type { ModifierKey as ModifierKeyType } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  disabled?: boolean;
  modifierKey?: ModifierKeyType;
}

const Template: Story<TemplateProps> = (args) => {
  const { disabled, modifierKey } = args;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan />
      <YAxisZoom disabled={disabled} modifierKey={modifierKey} />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  disabled: false,
  modifierKey: 'Shift', // Initialize to default value
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  modifierKey: 'Shift', // Initialize to default value
};

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  disabled: false,
  modifierKey: 'Control',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/PanZoom/Y Zoom',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['disabled', 'modifierKey'],
    },
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} as Meta;
