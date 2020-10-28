import React, { ReactElement, useState } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import { useInterval } from 'react-use';
import FillHeight from '../../.storybook/decorators/FillHeight';
import HeatmapVis, {
  HeatmapVisProps,
} from '../h5web/visualizations/heatmap/HeatmapVis';
import { ScaleType } from '../h5web/visualizations/shared/models';
import { INTERPOLATORS } from '../h5web/visualizations/heatmap/interpolators';
import { getDomain, mockValues } from '../packages/lib';
import { getMockDatasetDims } from '../h5web/providers/mock/utils';

// Prepare 2D data array
const values = mockValues.twoD.flat(Infinity) as number[];
const dataArray = ndarray<number>(values, getMockDatasetDims('twoD'));
const domain = getDomain(values);
const logSafeDomain = getDomain(values, ScaleType.Log);

const Template: Story<HeatmapVisProps> = (args): ReactElement => (
  <HeatmapVis {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});

Domain.args = {
  dataArray,
  domain: [-400, 400],
};

export const ColorMap = Template.bind({});

ColorMap.args = {
  dataArray,
  domain,
  colorMap: 'Rainbow',
};

export const LogScale = Template.bind({});

LogScale.args = {
  dataArray,
  domain: logSafeDomain,
  scaleType: ScaleType.Log,
};

export const SymLogScale = Template.bind({});

SymLogScale.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const IgnoreAspectRatio = Template.bind({});

IgnoreAspectRatio.args = {
  dataArray,
  domain,
  keepAspectRatio: false,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const LiveDataWithoutLoader: Story<HeatmapVisProps> = (
  args
): ReactElement => {
  const [shuffledArray, setShuffledArray] = useState(args.dataArray);

  useInterval(() => {
    const shuffledValues = shuffledArray.data
      .slice(0)
      .sort(() => 0.5 - Math.random());

    setShuffledArray(ndarray<number>(shuffledValues, dataArray.shape));
  }, 5000);

  return <HeatmapVis {...args} dataArray={shuffledArray} />;
};

LiveDataWithoutLoader.args = {
  dataArray,
  domain,
  showLoader: false,
};

export const CustomEdges = Template.bind({});

CustomEdges.args = {
  dataArray,
  domain,
  abscissaParams: {
    values: Array(dataArray.shape[1] + 1)
      .fill(0)
      .map((_, i) => 100 + 10 * i),
  },
  ordinateParams: {
    values: Array(dataArray.shape[0] + 1)
      .fill(0)
      .map((_, i) => -5 + 0.5 * i),
  },
};

export const CustomEdgesWithExtension = Template.bind({});

CustomEdgesWithExtension.args = {
  dataArray,
  domain,
  abscissaParams: {
    values: Array(dataArray.shape[1])
      .fill(0)
      .map((_, i) => 100 + 10 * i),
  },
  ordinateParams: {
    values: Array(dataArray.shape[0])
      .fill(0)
      .map((_, i) => -5 + 0.5 * i),
  },
};

export const WithAxesLabels = Template.bind({});

WithAxesLabels.args = {
  dataArray,
  domain,
  abscissaParams: { label: 'Latitude' },
  ordinateParams: { label: 'Longitude' },
};

export const WithTitle = Template.bind({});

WithTitle.args = {
  dataArray,
  domain,
  dataLabel: 'Pretty colors',
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // To keep mandatory args above optional ones.
    domain: {},
    colorMap: {
      defaultValue: 'Viridis',
      control: {
        type: 'select',
        options: Object.keys(INTERPOLATORS),
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
    keepAspectRatio: {
      defaultValue: true,
    },
    showGrid: {
      defaultValue: true,
    },
  },
};
