import type { LineVisProps } from '@h5web/lib';
import {
  LineVis,
  ScaleType,
  CurveType,
  getDomain,
  getMockDataArray,
  mockValues,
  getCombinedDomain,
  getDomains,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray);

const primaryArray = ndarray(mockValues.twoD[0]);
const secondaryArray = ndarray(mockValues.secondary[0]);
const tertiaryArray = ndarray(mockValues.tertiary[0]);
const combinedDomain = getCombinedDomain(
  getDomains([primaryArray, secondaryArray, tertiaryArray])
);

const abscissas = Array.from(
  { length: dataArray.size },
  (_, i) => -10 + 0.5 * i
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
    value: abscissas,
  },
};

export const DescendingAbscissas = Template.bind({});

DescendingAbscissas.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: [...abscissas].reverse(),
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
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  decorators: [FillHeight],
  args: {
    curveType: CurveType.LineOnly,
    scaleType: ScaleType.Linear,
    showGrid: true,
  },
  argTypes: {
    curveType: {
      control: { type: 'inline-radio' },
      options: [
        CurveType.LineOnly,
        CurveType.GlyphsOnly,
        CurveType.LineAndGlyphs,
      ],
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
    },
  },
} as Meta;
