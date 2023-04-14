import { ColorBar, type ColorBarProps, ScaleType } from '@h5web/lib';
import { type Meta, type Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

export interface TemplateProps extends Omit<ColorBarProps, 'domain'> {
  domainMin: number;
  domainMax: number;
}

const Template: Story<TemplateProps> = (args) => {
  const { domainMin: min, domainMax: max, ...colorBarArgs } = args;
  return <ColorBar {...colorBarArgs} domain={[min, max]} />;
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

export const LogScale = Template.bind({});
LogScale.args = { ...Default.args, scaleType: ScaleType.Log };

export const NegativeLogScale = Template.bind({});
NegativeLogScale.storyName = 'Log Scale with negative domain';
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

export const WithBounds = Template.bind({});
WithBounds.storyName = 'With bounds';
WithBounds.args = {
  ...Default.args,
  domainMin: -235.111,
  domainMax: 98765,
  withBounds: true,
};

export const EmptyDomain = Template.bind({});
EmptyDomain.storyName = 'Empty domain';
EmptyDomain.args = {
  ...Default.args,
  domainMin: 0,
  domainMax: 0,
  withBounds: true,
};

export const InvertColorMap = Template.bind({});
InvertColorMap.args = {
  ...Default.args,
  invertColorMap: true,
};

export { Template as ColorBarTemplate };
export default {
  title: 'Building Blocks/ColorBar',
  component: ColorBar,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { exclude: ['domain'] },
  },
  argTypes: {
    domainMin: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    domainMax: {
      control: { type: 'range', min: -10, max: 10, step: 0.1 },
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
    },
  },
  excludeStories: ['ColorBarTemplate'],
} as Meta;
