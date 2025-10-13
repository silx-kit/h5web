import { RadioGroup } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

type Option = 'Bar' | 'Baz';
const OPTIONS: Option[] = ['Bar', 'Baz'];

const meta = {
  title: 'Toolbar/RadioGroup',
  component: RadioGroup,
  argTypes: {
    options: { control: false },
    value: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default = {
  render: (args) => {
    const [value, setValue] = useState<Option>('Bar');

    return (
      <RadioGroup
        {...args}
        options={OPTIONS}
        value={value}
        onValueChanged={setValue}
      />
    );
  },
  args: {
    name: 'foo',
    label: 'Foo',
  },
} satisfies Story;
