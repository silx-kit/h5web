import type { Domain, HistogramProps } from '@h5web/lib';
import { Histogram, ScaleType } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';

import Center from './decorators/Center';

const Template: Story<Omit<HistogramProps, 'onChange'>> = (args) => {
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
};

export const Default = Template.bind({});

Default.args = {
  dataDomain: [4, 400],
  value: [10, 100],
  values: [130, 92, 76, 68, 60, 52, 50, 26],
  bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400],
  scaleType: ScaleType.Linear,
};

export const SmallDataDomain = Template.bind({});

SmallDataDomain.args = {
  ...Default.args,
  dataDomain: [100, 300],
};

export const WithColorMap = Template.bind({});

WithColorMap.args = {
  ...Default.args,
  colorMap: 'Blues',
  invertColorMap: true,
};

export const TypedValues = Template.bind({});

TypedValues.args = {
  ...Default.args,
  values: new Int32Array([26, 50, 52, 60, 68, 76, 92, 130]),
  bins: new Float32Array([4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400]),
};

export const NonInteractive: Story<Omit<HistogramProps, 'onChange'>> = (
  args
) => <Histogram {...args} />;

NonInteractive.args = {
  ...Default.args,
};

export default {
  title: 'Toolbar/Histogram',
  component: Histogram,
  decorators: [Center],
  parameters: {
    controls: { exclude: ['onChange'] },
  },
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: [
        ScaleType.Linear,
        ScaleType.SymLog,
        ScaleType.Log,
        ScaleType.Sqrt,
      ],
    },
  },
} as Meta;
