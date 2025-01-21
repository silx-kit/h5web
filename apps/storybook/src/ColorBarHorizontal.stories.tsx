import { type Meta, type StoryObj } from '@storybook/react';

import ColorBarStoriesMeta, {
  Default,
  type StoryProps,
} from './ColorBar.stories';

const meta = {
  ...ColorBarStoriesMeta,
  title: 'Building Blocks/ColorBar/Horizontal',
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

export const Horizontal = {
  ...Default,
  args: {
    ...Default.args,
    horizontal: true,
  },
} satisfies Story;

export const WithBounds = {
  ...Default,
  args: {
    ...Default.args,
    domainMin: -235.111,
    domainMax: 98_765,
    horizontal: true,
    withBounds: true,
  },
} satisfies Story;
