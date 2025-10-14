import { Menu } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MdIcecream } from 'react-icons/md';

const meta = {
  title: 'Toolbar/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default = {
  render: (args) => {
    return (
      <Menu {...args}>
        <div style={{ padding: '0.25rem 0.5rem' }}>Radio group, etc.</div>
      </Menu>
    );
  },
  args: {
    label: 'Icecream',
    Icon: MdIcecream,
  },
} satisfies Story;
