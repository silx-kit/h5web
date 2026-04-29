import { Pan, ResetZoomButton, VisCanvas, XAxisZoom } from '@h5web/lib';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/XAxisZoom',
  component: XAxisZoom,
  decorators: [FillHeight],
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
});

export const Default = meta.story({
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
    >
      <Pan />
      <XAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
});

export const ModifierKey = Default.extend({
  args: {
    modifierKey: ['Alt'],
  },
});

export const MultipleModifierKeys = Default.extend({
  args: {
    modifierKey: ['Control', 'Alt'],
  },
});

export const Disabled = Default.extend({
  args: {
    disabled: true,
  },
});

export const AutoDisabledInsideEqualAspectCanvas = meta.story({
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="equal"
    >
      <Pan />
      <XAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
  args: {
    disabled: true,
  },
});
