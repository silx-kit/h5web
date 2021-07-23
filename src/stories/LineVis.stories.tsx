import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import FillHeight from './decorators/FillHeight';
import {
  LineVis,
  LineVisProps,
  ScaleType,
  CurveType,
  getDomain,
  getMockDataArray,
  mockValues,
  getCombinedDomain,
} from '../packages/lib';
import { getDomains } from '../h5web/vis-packs/core/utils';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray);

const primaryArray = ndarray(mockValues.twoD[0]);
const secondaryArray = ndarray(mockValues.secondary[0]);
const tertiaryArray = ndarray(mockValues.tertiary[0]);
const combinedDomain = getCombinedDomain(
  getDomains([primaryArray, secondaryArray, tertiaryArray])
);

const errorsArray = ndarray(
  Array.from({ length: dataArray.size }, (_, i) => Math.abs(10 - 0.5 * i)),
  dataArray.shape
);

const Template: Story<LineVisProps> = (args) => <LineVis {...args} />;

export const Default = Template.bind({});

Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});

Domain.args = {
  dataArray,
  domain: [-100, 100],
};

export const Abscissas = Template.bind({});

Abscissas.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from({ length: dataArray.size }, (_, i) => -10 + 0.5 * i),
  },
};

export const ErrorBars = Template.bind({});

ErrorBars.args = {
  dataArray,
  domain: [-31, 31], // Extend domain to fit error bars
  errorsArray,
  showErrors: true,
};

export const AuxiliaryArrays = Template.bind({});

AuxiliaryArrays.args = {
  dataArray: primaryArray,
  auxArrays: [secondaryArray, tertiaryArray],
  domain: combinedDomain,
};

export default {
  title: 'Visualizations/LineVis',
  component: LineVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // to keep mandatory args above optional ones in controls add-on
    domain: {},
    curveType: {
      defaultValue: CurveType.LineOnly,
      control: {
        type: 'inline-radio',
        options: [
          CurveType.LineOnly,
          CurveType.GlyphsOnly,
          CurveType.LineAndGlyphs,
        ],
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
    showGrid: {
      defaultValue: true,
    },
  },
} as Meta;
