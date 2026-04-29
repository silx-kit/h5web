import { Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/Zoom',
  component: Zoom,
  decorators: [FillHeight],
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
});

export const Default = meta.story({
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
});

export const ModifierKey = Default.extend({
  args: {
    modifierKey: ['Control'],
  },
});

export const MultipleModifierKeys = Default.extend({
  args: {
    modifierKey: ['Control', 'Shift'],
  },
});

export const Disabled = Default.extend({
  args: {
    disabled: true,
  },
});
