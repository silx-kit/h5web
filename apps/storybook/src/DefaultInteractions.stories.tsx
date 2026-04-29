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

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const typedTwoD = toTypedNdArray(mockValues.twoD(), Float32Array);

const meta = preview.meta({
  title: 'Building Blocks/Interactions/DefaultInteractions',
  component: DefaultInteractions,
  decorators: [FillHeight],
  args: {
    pan: {},
    zoom: {},
    xAxisZoom: { modifierKey: 'Alt' },
    yAxisZoom: { modifierKey: 'Shift' },
    selectToZoom: { modifierKey: 'Control' },
    xSelectToZoom: { modifierKey: ['Control', 'Alt'] },
    ySelectToZoom: { modifierKey: ['Control', 'Shift'] },
  },
});

export const InsideAutoAspectCanvas = meta.story({
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
});

export const InsideEqualAspectCanvas = meta.story({
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
});
