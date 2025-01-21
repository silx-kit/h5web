import {
  assertDefined,
  AxialSelectToZoom,
  HeatmapMesh,
  Line,
  mockValues,
  Pan,
  ResetZoomButton,
  ScaleType,
  toTypedNdArray,
  useDomain,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react';
import { range } from 'd3-array';

import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();
const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

const meta = {
  title: 'Building Blocks/Interactions/AxialSelectToZoom',
  component: AxialSelectToZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    axis: 'x',
    modifierKey: [],
    disabled: false,
  },
  argTypes: {
    axis: { control: { type: 'inline-radio' } },
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} satisfies Meta<typeof AxialSelectToZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

const Default = {
  render: (args) => {
    const { modifierKey } = args;
    const domain = useDomain(oneD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, oneD.size], showGrid: true }}
        ordinateConfig={{ visDomain: domain, showGrid: true }}
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <AxialSelectToZoom {...args} />
        <ResetZoomButton />

        <Line abscissas={range(oneD.size)} ordinates={oneD.data} color="blue" />
      </VisCanvas>
    );
  },
} satisfies Story;

export const XAxis = {
  ...Default,
  args: {
    axis: 'x',
  },
} satisfies Story;

export const YAxis = {
  ...Default,
  args: {
    axis: 'y',
  },
} satisfies Story;

export const ModifierKeyX = {
  ...Default,
  args: {
    axis: 'x',
    modifierKey: ['Alt'],
  },
} satisfies Story;

export const MultipleModifierKeysY = {
  ...Default,
  args: {
    axis: 'y',
    modifierKey: ['Control', 'Shift'],
  },
} satisfies Story;

export const MinZoom = {
  ...Default,
  args: {
    minZoom: 200,
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    axis: 'x',
    disabled: true,
  },
} satisfies Story;

export const DisabledInsideEqualAspectCanvas = {
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
        <Pan modifierKey="Control" />
        <Zoom />
        <AxialSelectToZoom {...args} />
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
  argTypes: {
    modifierKey: { control: false },
    disabled: { control: false },
  },
} satisfies Story;
