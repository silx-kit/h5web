import {
  Pan,
  VisCanvas,
  Zoom,
  SelectToZoom,
  ResetZoomButton,
  HeatmapMesh,
  getDomain,
  AxialSelectToZoom,
} from '@h5web/lib';
import type { ModifierKey as ModifierKeyType } from '@h5web/lib';
import { mockValues, ScaleType } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const cols = 41;
const rows = 20;
const values = ndarray(Float32Array.from(mockValues.twoD.flat()), [rows, cols]);
const domain = getDomain(values);

function Image() {
  return (
    <HeatmapMesh
      values={values}
      domain={domain || [0, 1]}
      colorMap="Viridis"
      scaleType={ScaleType.Linear}
    />
  );
}

interface TemplateProps {
  modifierKey: ModifierKeyType;
  keepRatio?: boolean;
  xAxisZoomModifierKey: ModifierKeyType;
  yAxisZoomModifierKey: ModifierKeyType;
}

const Template: Story<TemplateProps> = (args) => {
  const { keepRatio, modifierKey, xAxisZoomModifierKey, yAxisZoomModifierKey } =
    args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-5, 5], showGrid: true }}
      ordinateConfig={{ visDomain: [-0.5, 1.5], showGrid: true }}
      visRatio={keepRatio ? cols / rows : undefined}
    >
      <Pan />
      <Zoom />
      <SelectToZoom modifierKey={modifierKey} keepRatio={keepRatio} />
      <AxialSelectToZoom
        axis="x"
        modifierKey={[modifierKey, xAxisZoomModifierKey]}
      />
      <AxialSelectToZoom
        axis="y"
        modifierKey={[modifierKey, yAxisZoomModifierKey]}
      />
      <ResetZoomButton />
      <Image />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  modifierKey: 'Control',
};

export const KeepRatio = Template.bind({});
KeepRatio.args = {
  modifierKey: 'Control',
  keepRatio: true,
};

export const AxialZoom = Template.bind({});
AxialZoom.args = {
  modifierKey: 'Control',
  xAxisZoomModifierKey: 'Alt',
  yAxisZoomModifierKey: 'Shift',
};

export default {
  title: 'Building Blocks/SelectToZoom',
  component: SelectToZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
    xAxisZoomModifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
    yAxisZoomModifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} as Meta;
