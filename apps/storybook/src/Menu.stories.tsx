import { Checkbox, Menu, MenuSeparator, RadioGroup } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MdIcecream } from 'react-icons/md';

type Option = 'Bar' | 'Baz';
const OPTIONS: Option[] = ['Bar', 'Baz'];

const meta = {
  title: 'Toolbar/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default = {
  render: (args) => {
    const [option, setOption] = useState<Option>('Bar');
    const [checked, setChecked] = useState(true);

    return (
      <Menu {...args}>
        <RadioGroup
          name="foo"
          label="Foo"
          options={OPTIONS}
          value={option}
          onChange={setOption}
        />
        <MenuSeparator />
        <Checkbox
          label="Some checkbox"
          checked={checked}
          onChange={setChecked}
        />
        <Checkbox
          label="Indeterminate"
          checked={checked}
          indeterminate={checked}
          disabled
        />
      </Menu>
    );
  },
  args: {
    label: 'Icecream',
    Icon: MdIcecream,
  },
} satisfies Story;
