import type { Meta } from '@storybook/react';
import ColorBarStoriesConfig, {
  ColorMapTemplate,
  Default,
} from './ColorBar.stories';

export const Horizontal = ColorMapTemplate.bind({});
Horizontal.args = {
  ...Default.args,
  horizontal: true,
};

export const WithBounds = ColorMapTemplate.bind({});
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
