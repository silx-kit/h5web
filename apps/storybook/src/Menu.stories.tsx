import { Checkbox, Menu, MenuSeparator, RadioGroup } from '@h5web/lib';
import { useState } from 'react';
import { MdIcecream } from 'react-icons/md';

import preview from '../.storybook/preview';

type Option = 'Bar' | 'Baz';
const OPTIONS: Option[] = ['Bar', 'Baz'];

const meta = preview.meta({
  title: 'Toolbar/Menu',
  component: Menu,
});

export const Default = meta.story({
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
});
