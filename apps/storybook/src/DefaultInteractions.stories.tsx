import { DefaultInteractions, ResetZoomButton, VisCanvas } from '@h5web/lib';
import type { DefaultInteractionsProps } from '@h5web/lib/src/interactions/DefaultInteractions';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const Template: Story<DefaultInteractionsProps> = (args) => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <DefaultInteractions {...args} />
      <ResetZoomButton />
    </VisCanvas>
  );
};

export const Default = Template.bind({});

export default {
  title: 'Building Blocks/DefaultInteractions',
  component: DefaultInteractions,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    keepRatio: { defaultValue: false },
    pan: { defaultValue: {} },
    zoom: { defaultValue: {} },
    xAxisZoom: { defaultValue: { modifierKey: 'Alt' } },
    yAxisZoom: { defaultValue: { modifierKey: 'Shift' } },
    selectToZoom: { defaultValue: { modifierKey: 'Control' } },
    xSelectToZoom: { defaultValue: { modifierKey: ['Control', 'Alt'] } },
    ySelectToZoom: { defaultValue: { modifierKey: ['Control', 'Shift'] } },
  },
} as Meta<DefaultInteractionsProps>;
