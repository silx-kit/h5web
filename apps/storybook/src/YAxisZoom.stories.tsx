import { Pan, ResetZoomButton, VisCanvas, YAxisZoom } from '@h5web/lib';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/YAxisZoom',
  component: YAxisZoom,
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
      <YAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
});

export const ModifierKey = Default.extend({
  args: {
    modifierKey: ['Shift'],
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

export const AutoDisabledInsideEqualAspectCanvas = meta.story({
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
  args: {
    disabled: false,
  },
});
