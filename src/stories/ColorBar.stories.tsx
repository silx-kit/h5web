import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import FillHeight from '../../.storybook/decorators/FillHeight';
import ColorBar from '../h5web/visualizations/heatmap/ColorBar';
import { ScaleType } from '../h5web/visualizations/shared/models';
import type { ColorMap } from '../h5web/visualizations/heatmap/models';

interface Props {
  domainMin: number;
  domainMax: number;
  scaleType: ScaleType;
  colorMap: ColorMap;
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

export const ColorMapTemplate = Template.bind({});
ColorMapTemplate.storyName = 'Color Map';
ColorMapTemplate.args = { ...Default.args, colorMap: 'Blues' };

export const DomainTemplate = Template.bind({});
DomainTemplate.storyName = 'Domain';
DomainTemplate.args = { ...Default.args, domainMin: -10, domainMax: 10 };

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

export default {
  title: 'Visualizations/HeatmapVis/ColorBar',
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
