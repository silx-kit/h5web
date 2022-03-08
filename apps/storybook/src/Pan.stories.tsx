import { Pan, VisCanvas, Zoom } from '@h5web/lib';
import type { ModifierKey as ModifierKeyType } from '@h5web/lib/src/vis/models';
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
      <Pan disabled={disabled} modifierKey={modifierKey} />
      <Zoom />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  disabled: false,
  modifierKey: undefined,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  modifierKey: undefined,
};

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  disabled: false,
  modifierKey: 'Shift',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/PanZoom/Pan',
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
