import {
  assertDefined,
  DefaultInteractions,
  HeatmapMesh,
  mockValues,
  ResetZoomButton,
  ScaleType,
  toTypedNdArray,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

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
    const [rows, cols] = typedTwoD.shape;
    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
        aspect="auto"
      >
        <DefaultInteractions {...args} />
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
    const [rows, cols] = typedTwoD.shape;
    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
        aspect="equal"
      >
        <DefaultInteractions {...args} />
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
