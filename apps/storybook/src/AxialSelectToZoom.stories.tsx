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
import { range } from 'd3-array';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();
const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

const meta = preview.meta({
  title: 'Building Blocks/Interactions/AxialSelectToZoom',
  component: AxialSelectToZoom,
  decorators: [FillHeight],
  argTypes: {
    axis: {
      control: { type: 'inline-radio' },
      options: ['x', 'y'],
    },
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
});

export const XAxis = meta.story({
  render: (args) => {
    const { modifierKey = [] } = args;
    const domain = useDomain(oneD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, oneD.size], showGrid: true }}
        ordinateConfig={{ visDomain: domain, showGrid: true }}
      >
        <Pan modifierKey={modifierKey.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <AxialSelectToZoom {...args} />
        <ResetZoomButton />

        <Line abscissas={range(oneD.size)} ordinates={oneD.data} color="blue" />
      </VisCanvas>
    );
  },
  args: {
    axis: 'x',
  },
});

export const YAxis = XAxis.extend({
  args: {
    axis: 'y',
  },
});

export const ModifierKeyX = XAxis.extend({
  args: {
    axis: 'x',
    modifierKey: ['Alt'],
  },
});

export const MultipleModifierKeysY = XAxis.extend({
  args: {
    axis: 'y',
    modifierKey: ['Control', 'Shift'],
  },
});

export const MinZoom = XAxis.extend({
  args: {
    minZoom: 200,
  },
});

export const Disabled = XAxis.extend({
  args: {
    axis: 'x',
    disabled: true,
  },
});

export const DisabledInsideEqualAspectCanvas = meta.story({
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
  args: {
    axis: 'x',
  },
  argTypes: {
    modifierKey: { control: false },
    disabled: { control: false },
  },
});
