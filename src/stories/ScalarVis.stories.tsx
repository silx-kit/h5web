import type { Story } from '@storybook/react/types-6-0';
import { ScalarVis, ScalarVisProps } from '../packages/lib';

const Template: Story<ScalarVisProps> = (args) => <ScalarVis {...args} />;

export const DisplayNumber = Template.bind({});

DisplayNumber.args = {
  value: 1024,
};

export const DisplayString = Template.bind({});

DisplayString.args = {
  value: 'This is a scalar',
};

export const DisplayBoolean = Template.bind({});

DisplayBoolean.args = {
  value: false,
};

export const DisplayComplex = Template.bind({});

DisplayComplex.args = {
  value: [1.2, 3],
};

export default {
  title: 'Visualizations/ScalarVis',
  component: ScalarVis,
};
