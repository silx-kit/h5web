import {
  HeatmapMesh,
  Pan,
  ResetZoomButton,
  SelectToZoom,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { mockValues, ScaleType } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { useMockData } from './hooks';

const meta = {
  title: 'Building Blocks/Interactions/SelectToZoom',
  component: SelectToZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
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
} satisfies Meta<typeof SelectToZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InsideAutoAspectCanvas = {
  render: function Template(args) {
    const { values, domain } = useMockData(mockValues.twoD, [20, 41]);
    const { modifierKey } = args;

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, values.shape[1]], showGrid: true }}
        ordinateConfig={{ visDomain: [0, values.shape[0]], showGrid: true }}
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <SelectToZoom {...args} />
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
  render: function Template(args) {
    const { values, domain } = useMockData(mockValues.twoD, [20, 41]);
    const { modifierKey } = args;

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, values.shape[1]], showGrid: true }}
        ordinateConfig={{ visDomain: [0, values.shape[0]], showGrid: true }}
        aspect="equal"
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <SelectToZoom {...args} />
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

export const ModifierKey = {
  ...InsideAutoAspectCanvas,
  args: {
    modifierKey: ['Control'],
  },
} satisfies Story;

export const MultipleModifierKeys = {
  ...InsideAutoAspectCanvas,
  args: {
    modifierKey: ['Control', 'Shift'],
  },
} satisfies Story;

export const MinZoom = {
  ...InsideAutoAspectCanvas,
  args: {
    minZoom: 200,
  },
} satisfies Story;

export const Disabled = {
  ...InsideAutoAspectCanvas,
  args: {
    disabled: true,
  },
} satisfies Story;
