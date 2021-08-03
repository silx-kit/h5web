import type { Meta, Story } from '@storybook/react/types-6-0';
import { CustomDomain, DomainSlider, ScaleType } from '../packages/lib';
import type { DomainSliderProps } from '../h5web/toolbar/controls/DomainSlider/DomainSlider';
import { useState } from 'react';
import Center from './decorators/Center';

const Template: Story<Omit<DomainSliderProps, 'onCustomDomainChange'>> = (
  args
) => {
  const { customDomain: initialDomain = [null, null], ...otherArgs } = args;
  const [domain, setDomain] = useState<CustomDomain>(initialDomain);

  return (
    <DomainSlider
      customDomain={domain}
      onCustomDomainChange={setDomain}
      {...otherArgs}
    />
  );
};

export const Default = Template.bind({});

Default.args = {
  dataDomain: [4, 400],
  scaleType: ScaleType.Linear,
};

export const WithError = Template.bind({});

WithError.args = {
  dataDomain: [4, 400],
  customDomain: [20, 10], // Putting a higher min
  scaleType: ScaleType.Linear,
};

export const Histogram = Template.bind({});

Histogram.args = {
  ...Default.args,
  histogram: {
    values: [130, 92, 76, 68, 60, 52, 50, 26],
    bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400],
  },
};

export const HistogramWithColorMap = Template.bind({});

HistogramWithColorMap.args = {
  ...Default.args,
  histogram: {
    values: [130, 92, 76, 68, 60, 52, 50, 26],
    bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5, 400],
    colorMap: 'Blues',
    invertColorMap: true,
  },
};

export default {
  title: 'Building Blocks/DomainSlider',
  component: DomainSlider,
  decorators: [Center],
  parameters: {
    controls: { exclude: ['customDomain', 'onCustomDomainChange'] },
  },
  argTypes: {
    scaleType: {
      control: {
        type: 'inline-radio',
        options: [
          ScaleType.Linear,
          ScaleType.SymLog,
          ScaleType.Log,
          ScaleType.Sqrt,
        ],
      },
    },
  },
} as Meta;
