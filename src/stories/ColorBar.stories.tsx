import type { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import FillHeight from './decorators/FillHeight';
import { ColorBar, ScaleType, ColorMap } from '../packages/lib';

interface Props {
  domainMin: number;
  domainMax: number;
  scaleType: ScaleType;
  colorMap: ColorMap;
  horizontal?: boolean;
}

const Template: Story<Props> = (args): ReactElement => {
  const { domainMin: min, domainMax: max, ...colorBarArgs } = args;
  return <ColorBar domain={[min, max]} {...colorBarArgs} />;
};

export const Default = Template.bind({});

Default.args = {
  domainMin: 0.1,
  domainMax: 1,
  scaleType: ScaleType.Linear,
  colorMap: 'Viridis',
};

export const ColorMapStory = Template.bind({});
ColorMapStory.storyName = 'Color Map';
ColorMapStory.args = { ...Default.args, colorMap: 'Blues' };

export const DomainStory = Template.bind({});
DomainStory.storyName = 'Domain';
DomainStory.args = { ...Default.args, domainMin: -10, domainMax: 10 };

export const LogScale = Template.bind({});
LogScale.args = { ...Default.args, scaleType: ScaleType.Log };

export const NegativeLogScale = Template.bind({});
NegativeLogScale.storyName = 'Log Scale with negative values';
NegativeLogScale.args = {
  ...Default.args,
  scaleType: ScaleType.Log,
  domainMin: -10,
  domainMax: -1,
};

export const SymLogScale = Template.bind({});
SymLogScale.args = {
  ...Default.args,
  scaleType: ScaleType.SymLog,
  domainMin: -6,
  domainMax: 6,
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  ...Default.args,
  horizontal: true,
};

export default {
  title: 'Building Blocks/ColorBar',
  component: ColorBar,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    domainMin: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    domainMax: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    domain: { control: { disable: true } },
    scaleType: {
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
  },
};
