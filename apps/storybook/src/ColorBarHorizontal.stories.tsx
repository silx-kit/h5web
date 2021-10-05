import type { Meta, Story } from '@storybook/react';

import type { TemplateProps } from './ColorBar.stories';
import ColorBarStoriesConfig, {
  ColorMapTemplate,
  Default,
} from './ColorBar.stories';

export const Horizontal: Story<TemplateProps> = ColorMapTemplate.bind({});
Horizontal.args = {
  ...Default.args,
  horizontal: true,
};

export const WithBounds: Story<TemplateProps> = ColorMapTemplate.bind({});
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
