import type { Meta, Story } from '@storybook/react';

import type { TemplateProps } from './ColorBar.stories';
import ColorBarStoriesConfig, {
  ColorBarTemplate,
  Default,
} from './ColorBar.stories';

export const Horizontal: Story<TemplateProps> = ColorBarTemplate.bind({});
Horizontal.args = {
  ...Default.args,
  horizontal: true,
};

export const WithBounds: Story<TemplateProps> = ColorBarTemplate.bind({});
WithBounds.args = {
  ...Default.args,
  domainMin: -235.111,
  domainMax: 98765,
  horizontal: true,
  withBounds: true,
};

export default {
  ...ColorBarStoriesConfig,
  title: 'Building Blocks/ColorBar/Horizontal',
} as Meta;
