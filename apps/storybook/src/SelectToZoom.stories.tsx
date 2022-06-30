import {
  Pan,
  VisCanvas,
  SelectToZoom,
  ResetZoomButton,
  HeatmapMesh,
  getDomain,
  Zoom,
} from '@h5web/lib';
import type { SelectToZoomProps } from '@h5web/lib';
import { mockValues, ScaleType } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const cols = 41;
const rows = 20;
const values = ndarray(Float32Array.from(mockValues.twoD.flat()), [rows, cols]);
const domain = getDomain(values);

const Template: Story<SelectToZoomProps> = (args) => {
  const { keepRatio, modifierKey, disabled } = args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-5, 5], showGrid: true }}
      ordinateConfig={{ visDomain: [-0.5, 1.5], showGrid: true }}
      visRatio={keepRatio ? cols / rows : undefined}
    >
      <Pan />
      <Zoom />
      <SelectToZoom
        modifierKey={modifierKey}
        keepRatio={keepRatio}
        disabled={disabled}
      />
      <ResetZoomButton />

      <HeatmapMesh
        values={values}
        domain={domain || [0, 1]}
        colorMap="Viridis"
        scaleType={ScaleType.Linear}
      />
    </VisCanvas>
  );
};

export const Default = Template.bind({});

export const KeepRatio = Template.bind({});
KeepRatio.args = {
  keepRatio: true,
};

export const ModifierKey = Template.bind({});
ModifierKey.args = {
  modifierKey: ['Control'],
};

export const MultipleModifierKeys = Template.bind({});
MultipleModifierKeys.args = {
  modifierKey: ['Control', 'Shift'],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export default {
  title: 'Building Blocks/Interactions/SelectToZoom',
  component: SelectToZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    keepRatio: false,
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
