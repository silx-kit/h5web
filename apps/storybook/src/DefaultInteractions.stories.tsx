import { DefaultInteractions, ResetZoomButton, VisCanvas } from '@h5web/lib';
import type { DefaultInteractionsConfig } from '@h5web/lib/src/interactions/DefaultInteractions';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

export const InsideAutoAspectCanvas: Story<DefaultInteractionsConfig> = (
  args
) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="auto"
    >
      <DefaultInteractions {...args} />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export const InsideEqualAspectCanvas: Story<DefaultInteractionsConfig> = (
  args
) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="equal"
    >
      <DefaultInteractions {...args} />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export default {
  title: 'Building Blocks/Interactions/DefaultInteractions',
  component: DefaultInteractions,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    pan: {},
    zoom: {},
    xAxisZoom: { modifierKey: 'Alt' },
    yAxisZoom: { modifierKey: 'Shift' },
    selectToZoom: { modifierKey: 'Control' },
    xSelectToZoom: { modifierKey: ['Control', 'Alt'] },
    ySelectToZoom: { modifierKey: ['Control', 'Shift'] },
  },
} as Meta<DefaultInteractionsConfig>;
