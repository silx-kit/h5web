import type { CustomDomain } from '@h5web/lib';
import { DomainSlider, ScaleType } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Center from './decorators/Center';

const meta = {
  title: 'Toolbar/DomainSlider',
  component: DomainSlider,
  decorators: [Center],
  args: {
    customDomain: undefined,
  },
  argTypes: {
    customDomain: { control: false },
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
} satisfies Meta<typeof DomainSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Template(args) {
    const { customDomain: initialDomain = [null, null], ...otherArgs } = args;
    const [domain, setDomain] = useState<CustomDomain>(initialDomain);

    return (
      <DomainSlider
        {...otherArgs}
        customDomain={domain}
        onCustomDomainChange={setDomain}
      />
    );
  },
  args: {
    dataDomain: [4, 400],
    scaleType: ScaleType.Linear,
  },
} satisfies Story;

export const WithError = {
  ...Default,
  args: {
    ...Default.args,
    customDomain: [20, 10], // Putting a higher min
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    ...Default.args,
    disabled: true,
  },
} satisfies Story;

export const Histogram = {
  ...Default,
  args: {
    ...Default.args,
    histogram: {
      values: [130, 92, 76, 68, 60, 52, 50, 26],
      bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400],
    },
  },
} satisfies Story;

export const HistogramBiggerThanDataDomain = {
  ...Default,
  args: {
    ...Histogram.args,
    dataDomain: [100, 300],
  },
} satisfies Story;

export const HistogramWithColorMap = {
  ...Default,
  args: {
    ...Histogram.args,
    histogram: {
      ...Histogram.args.histogram,
      colorMap: 'Blues',
      invertColorMap: true,
    },
  },
} satisfies Story;

export const HistogramWithoutLeftAxis = {
  ...Default,
  args: {
    ...HistogramWithColorMap.args,
    histogram: {
      ...HistogramWithColorMap.args.histogram,
      showLeftAxis: false,
    },
  },
} satisfies Story;

export const TypedHistogram = {
  ...Default,
  args: {
    ...Default.args,
    histogram: {
      values: new Int32Array([26, 50, 52, 60, 68, 76, 92, 130]),
      bins: new Float32Array([
        4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400,
      ]),
    },
  },
} satisfies Story;
