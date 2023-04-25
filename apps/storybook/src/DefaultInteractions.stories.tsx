import {
  DefaultInteractions,
  HeatmapMesh,
  mockValues,
  ResetZoomButton,
  ScaleType,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { useMockData } from './hooks';

const { twoD } = mockValues;

const meta = {
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
} satisfies Meta<typeof DefaultInteractions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InsideAutoAspectCanvas = {
  render: (args) => {
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
  },
} satisfies Story;

export const InsideEqualAspectCanvas = {
  render: (args) => {
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
  },
} satisfies Story;
