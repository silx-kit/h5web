import {
  Pan,
  VisCanvas,
  Zoom,
  SelectToZoom,
  ResetZoomButton,
  HeatmapMesh,
  getDomain,
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
  clampCenter?: boolean;
}

const Template: Story<TemplateProps> = (args) => {
  const { keepRatio } = args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-5, 5], showGrid: true }}
      ordinateConfig={{ visDomain: [-0.5, 1.5], showGrid: true }}
      visRatio={keepRatio ? cols / rows : undefined}
    >
      <Pan />
      <Zoom />
      <SelectToZoom {...args} />
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

export const ClampCenter = Template.bind({});
ClampCenter.args = {
  ...Default.args,
  clampCenter: true,
};

export const KeepRatioAndClampCenter = Template.bind({});
KeepRatioAndClampCenter.args = {
  ...Default.args,
  keepRatio: true,
  clampCenter: true,
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
  },
} as Meta;
