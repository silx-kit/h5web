import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import type { HDF5Value } from '../h5web/providers/models';
import { ScalarVis } from '../packages/lib';

const numberData = 1024;
const stringData = 'This is a scalar';

const Template: Story<{ value: HDF5Value }> = (args): ReactElement => {
  const { value } = args;
  return <ScalarVis value={value} />;
};

export const DisplayNumber = Template.bind({});

DisplayNumber.args = {
  value: numberData,
};

export const DisplayString = Template.bind({});

DisplayString.args = {
  value: stringData,
};

export default {
  title: 'Visualizations/ScalarVis',
  component: ScalarVis,
};
