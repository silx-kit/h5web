import type { Story } from '@storybook/react/types-6-0';
import FillHeight from './decorators/FillHeight';
import {
  HeatmapVis,
  HeatmapVisProps,
  ScaleType,
  getDomain,
  getMockDataArray,
  INTERPOLATORS,
} from '../packages/lib';
import ndarray from 'ndarray';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const dataValues = dataArray.data as number[];
const domain = getDomain(dataValues);
const logSafeDomain = getDomain(dataValues, ScaleType.Log);

const alphaArray = ndarray(dataValues.map((x) => Math.abs(x)));
const alphaDomain = getDomain(alphaArray);

const Template: Story<HeatmapVisProps> = (args) => <HeatmapVis {...args} />;

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

export const FillLayout = Template.bind({});

FillLayout.args = {
  dataArray,
  domain,
  layout: 'fill',
};

export const ContainLayout = Template.bind({});

ContainLayout.args = {
  dataArray,
  domain,
  layout: 'contain',
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const CustomEdges = Template.bind({});

CustomEdges.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from(
      { length: dataArray.shape[1] + 1 },
      (_, i) => 100 + 10 * i
    ),
  },
  ordinateParams: {
    value: Array.from(
      { length: dataArray.shape[0] + 1 },
      (_, i) => -5 + 0.5 * i
    ),
  },
};

export const CustomEdgesWithExtension = Template.bind({});

CustomEdgesWithExtension.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from({ length: dataArray.shape[1] }, (_, i) => 100 + 10 * i),
  },
  ordinateParams: {
    value: Array.from({ length: dataArray.shape[0] }, (_, i) => -5 + 0.5 * i),
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
  title: 'Pretty colors',
};

export const InvertColorMap = Template.bind({});

InvertColorMap.args = {
  dataArray,
  domain,
  invertColorMap: true,
};

export const ScrollCaptured = Template.bind({});
ScrollCaptured.args = { dataArray, domain };

ScrollCaptured.decorators = [
  (VisCanvasStory: Story) => (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        <VisCanvasStory />
      </div>
      <div style={{ height: 500 }} />
    </>
  ),
];

export const WithAlphaArray = Template.bind({});

WithAlphaArray.args = {
  dataArray,
  domain,
  alphaArray,
  alphaDomain,
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
    layout: {
      defaultValue: 'cover',
      control: {
        type: 'inline-radio',
        options: ['contain', 'cover', 'fill'],
      },
    },
    showGrid: {
      defaultValue: true,
    },
  },
};
