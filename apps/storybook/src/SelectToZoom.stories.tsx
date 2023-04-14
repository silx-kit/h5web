import {
  HeatmapMesh,
  Pan,
  ResetZoomButton,
  SelectToZoom,
  type SelectToZoomProps,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { mockValues, ScaleType } from '@h5web/shared';
import { type Meta, type Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { useMockData } from './hooks';

const { twoD } = mockValues;

const Template: Story<SelectToZoomProps> = (args) => {
  const { values, domain } = useMockData(twoD, [20, 41]);
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
};

export const InsideAutoAspectCanvas = Template.bind({});

export const InsideEqualAspectCanvas: Story<SelectToZoomProps> = (args) => {
  const { values, domain } = useMockData(twoD, [20, 41]);
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
};

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  modifierKey: ['Control'],
};

export const MultipleModifierKeys = Template.bind({});
MultipleModifierKeys.args = {
  modifierKey: ['Control', 'Shift'],
};

export const MinZoom = Template.bind({});
MinZoom.args = { minZoom: 200 };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export default {
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
} as Meta<SelectToZoomProps>;
