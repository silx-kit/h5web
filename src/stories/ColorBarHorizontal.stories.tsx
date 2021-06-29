import type { Meta, Story } from '@storybook/react';
import ColorBarStoriesConfig, { Default } from './ColorBar.stories';
import { ColorBar } from '../packages/lib';
import type { TemplateProps } from './ColorBar.stories';

const Template: Story<TemplateProps> = (args) => {
  const { domainMin: min, domainMax: max, ...colorBarArgs } = args;
  return <ColorBar {...colorBarArgs} domain={[min, max]} />;
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  ...Default.args,
  horizontal: true,
};

export const WithBounds = Template.bind({});
WithBounds.args = {
  ...Default.args,
  domainMin: -235.111,
  domainMax: 98_765,
  horizontal: true,
  withBounds: true,
};

export default {
  ...ColorBarStoriesConfig,
  title: 'Building Blocks/ColorBar/Horizontal',
} as Meta;
