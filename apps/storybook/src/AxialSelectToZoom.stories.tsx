import type { AxialSelectToZoomProps } from '@h5web/lib';
import { useDomain } from '@h5web/lib';
import { assertDefined } from '@h5web/lib';
import { HeatmapMesh, ScaleType } from '@h5web/lib';
import { mockValues } from '@h5web/lib';
import { Zoom } from '@h5web/lib';
import {
  DataCurve,
  AxialSelectToZoom,
  Pan,
  ResetZoomButton,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { range } from 'lodash';

import FillHeight from './decorators/FillHeight';
import { useMockData } from './hooks';

const { oneD, twoD } = mockValues;

const Template: Story<AxialSelectToZoomProps> = (args) => {
  const { modifierKey } = args;
  const domain = useDomain(oneD);
  assertDefined(domain);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, oneD.length], showGrid: true }}
      ordinateConfig={{ visDomain: domain, showGrid: true }}
    >
      <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
      <Zoom />
      <AxialSelectToZoom {...args} />
      <ResetZoomButton />

      <DataCurve
        abscissas={range(oneD.length)}
        ordinates={oneD}
        color="blue"
        showErrors
      />
    </VisCanvas>
  );
};

export const DefaultX = Template.bind({});
DefaultX.args = { axis: 'x' };

export const DefaultY = Template.bind({});
DefaultY.args = { axis: 'y' };

export const ModifierKeyX = Template.bind({});
ModifierKeyX.args = {
  axis: 'x',
  modifierKey: ['Alt'],
};

export const MultipleModifierKeysY = Template.bind({});
MultipleModifierKeysY.args = {
  axis: 'y',
  modifierKey: ['Control', 'Shift'],
};

export const Disabled = Template.bind({});
Disabled.args = {
  axis: 'x',
  disabled: true,
};

export const DisabledInsideEqualAspectCanvas: Story<AxialSelectToZoomProps> = (
  args
) => {
  const { values, domain } = useMockData(twoD, [20, 41]);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
      aspect="equal"
    >
      <Pan modifierKey="Control" />
      <Zoom />
      <AxialSelectToZoom {...args} />
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

DisabledInsideEqualAspectCanvas.argTypes = {
  modifierKey: { control: false },
  disabled: { control: false },
};

export default {
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
} as Meta<AxialSelectToZoomProps>;
