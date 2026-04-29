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

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

const meta = preview.meta({
  title: 'Building Blocks/Interactions/SelectToZoom',
  component: SelectToZoom,
  decorators: [FillHeight],
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
});

export const InsideAutoAspectCanvas = meta.story({
  render: (args) => {
    const { modifierKey = [] } = args;
    const [rows, cols] = typedTwoD.shape;

    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
      >
        <Pan modifierKey={modifierKey.length === 0 ? 'Control' : undefined} />
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
});

export const InsideEqualAspectCanvas = meta.story({
  render: (args) => {
    const { modifierKey = [] } = args;
    const [rows, cols] = typedTwoD.shape;

    const domain = useDomain(typedTwoD);
    assertDefined(domain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], showGrid: true }}
        ordinateConfig={{ visDomain: [0, rows], showGrid: true }}
        aspect="equal"
      >
        <Pan modifierKey={modifierKey.length === 0 ? 'Control' : undefined} />
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
});

export const ModifierKey = InsideAutoAspectCanvas.extend({
  args: {
    modifierKey: ['Control'],
  },
});

export const MultipleModifierKeys = InsideAutoAspectCanvas.extend({
  args: {
    modifierKey: ['Control', 'Shift'],
  },
});

export const MinZoom = InsideAutoAspectCanvas.extend({
  args: {
    minZoom: 200,
  },
});

export const Disabled = InsideAutoAspectCanvas.extend({
  args: {
    disabled: true,
  },
});
