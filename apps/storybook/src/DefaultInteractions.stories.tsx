import {
  DefaultInteractions,
  HeatmapMesh,
  mockValues,
  ResetZoomButton,
  ScaleType,
  VisCanvas,
} from '@h5web/lib';
import type { DefaultInteractionsConfig } from '@h5web/lib/src/interactions/DefaultInteractions';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { useMockData } from './hooks';

const { twoD } = mockValues;

export const InsideAutoAspectCanvas: Story<DefaultInteractionsConfig> = (
  args
) => {
  const { values, domain } = useMockData(twoD, [20, 41]);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, values.shape[1]], showGrid: true }}
      ordinateConfig={{ visDomain: [0, values.shape[0]], showGrid: true }}
      aspect="auto"
    >
      <DefaultInteractions {...args} />
      <ResetZoomButton />

      <HeatmapMesh
        values={values}
        domain={domain}
        colorMap="Viridis"
        scaleType={ScaleType.Linear}
      />
    </VisCanvas>
  );
};

export const InsideEqualAspectCanvas: Story<DefaultInteractionsConfig> = (
  args
) => {
  const { values, domain } = useMockData(twoD, [20, 41]);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, values.shape[1]], showGrid: true }}
      ordinateConfig={{ visDomain: [0, values.shape[0]], showGrid: true }}
      aspect="equal"
    >
      <DefaultInteractions {...args} />
      <ResetZoomButton />

      <HeatmapMesh
        values={values}
        domain={domain}
        colorMap="Viridis"
        scaleType={ScaleType.Linear}
      />
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
