import type { AxialSelectToZoomProps } from '@h5web/lib';
import { mockValues, useDomain } from '@h5web/lib';
import { Zoom } from '@h5web/lib';
import {
  assertDefined,
  DataCurve,
  getAxisValues,
  AxialSelectToZoom,
  Pan,
  ResetZoomButton,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const Template: Story<AxialSelectToZoomProps> = (args) => {
  const domain = useDomain(mockValues.oneD);
  assertDefined(domain);

  return (
    <VisCanvas
      abscissaConfig={{
        visDomain: [0, mockValues.oneD.length],
        showGrid: true,
      }}
      ordinateConfig={{ visDomain: domain, showGrid: true }}
    >
      <Pan />
      <Zoom />
      <AxialSelectToZoom {...args} />
      <ResetZoomButton />

      <DataCurve
        abscissas={getAxisValues(undefined, mockValues.oneD.length)}
        ordinates={mockValues.oneD}
        errors={mockValues.oneD_errors}
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
