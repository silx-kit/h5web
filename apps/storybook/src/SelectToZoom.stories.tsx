import {
  assertDefined,
  HeatmapMesh,
  mockValues,
  Pan,
  ResetZoomButton,
  SelectToZoom,
  toTypedNdArray,
  useDomain,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { ScaleType } from '@h5web/shared/vis-models';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

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
  render: (args) => {
    const { modifierKey } = args;
    const [rows, cols] = typedTwoD.shape;

    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <SelectToZoom {...args} />
        <ResetZoomButton />

        <HeatmapMesh
          values={typedTwoD}
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
    const { modifierKey } = args;
    const [rows, cols] = typedTwoD.shape;

    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
        aspect="equal"
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <SelectToZoom {...args} />
        <ResetZoomButton />

        <HeatmapMesh
          values={typedTwoD}
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
