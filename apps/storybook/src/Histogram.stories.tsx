import type { Domain } from '@h5web/lib';
import { Histogram, ScaleType } from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Center from './decorators/Center';

const meta = {
  title: 'Toolbar/Histogram',
  component: Histogram,
  decorators: [Center],
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    onChange: { control: false },
  },
} satisfies Meta<typeof Histogram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { value, ...otherArgs } = args;
    const [domain, setDomain] = useState<Domain>(value);

    return (
      <div>
        <p>
          Domain: [{domain[0].toFixed(2)}, {domain[1].toFixed(2)}]
        </p>
        <Histogram {...otherArgs} value={domain} onChange={setDomain} />
      </div>
    );
  },
  args: {
    dataDomain: [4, 400],
    value: [10, 100],
    values: [130, 92, 76, 68, 60, 52, 50, 26],
    bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400],
    scaleType: ScaleType.Linear,
  },
} satisfies Story;

export const SmallDataDomain = {
  ...Default,
  args: {
    ...Default.args,
    dataDomain: [100, 300],
  },
} satisfies Story;

export const WithColorMap = {
  ...Default,
  args: {
    ...Default.args,
    colorMap: 'Blues',
    invertColorMap: true,
  },
} satisfies Story;

export const TypedValues = {
  ...Default,
  args: {
    ...Default.args,
    values: new Int32Array([26, 50, 52, 60, 68, 76, 92, 130]),
    bins: new Float32Array([4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400]),
  },
} satisfies Story;

export const HideLeftAxis = {
  ...Default,
  args: {
    ...Default.args,
    showLeftAxis: false,
  },
} satisfies Story;

export const NonInteractive = {
  args: {
    ...Default.args,
    onChange: undefined, // explicitely set to `undefined`, as Storybook seems to register default event handlers
  },
} satisfies Story;
