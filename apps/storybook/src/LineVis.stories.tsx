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
import { toTypedNdArray } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/oneD_linear');
const domain = getDomain(dataArray);

const primaryArray = ndarray(mockValues.twoD[0]);
const secondaryArray = ndarray(mockValues.secondary[0]);
const tertiaryArray = ndarray(mockValues.tertiary[0]);

const abscissas = Array.from(
  { length: dataArray.size },
  (_, i) => -10 + 0.5 * i
);
const errorsArray = ndarray(
  Array.from({ length: dataArray.size }, (_, i) => Math.abs(10 - 0.5 * i)),
  dataArray.shape
);

const Template: Story<LineVisProps> = (args) => {
  const {
    dataArray,
    domain: storyDomain,
    scaleType,
    errorsArray,
    auxiliaries,
  } = args;

  // If story doesn't provide `domain`, compute it automatically
  const auxArrays = (auxiliaries || []).map(({ array }) => array);
  const domain =
    storyDomain ||
    getCombinedDomain([
      getDomain(dataArray, scaleType, errorsArray),
      ...getDomains(auxArrays, scaleType),
    ]);

  return <LineVis {...args} domain={domain} />;
};

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
  errorsArray,
  showErrors: true,
};

export const AuxiliaryArrays = Template.bind({});
AuxiliaryArrays.args = {
  dataArray: primaryArray,
  auxiliaries: [{ array: secondaryArray }, { array: tertiaryArray }],
};

export const AuxiliaryLabels = Template.bind({});
AuxiliaryLabels.args = {
  dataArray: primaryArray,
  auxiliaries: [
    { label: 'secondary', array: secondaryArray },
    { label: 'tertiary', array: tertiaryArray },
  ],
};

export const AuxiliaryErrors = Template.bind({});
AuxiliaryErrors.args = {
  dataArray: primaryArray,
  errorsArray,
  auxiliaries: [
    { label: 'secondary', array: secondaryArray, errors: errorsArray },
    { label: 'tertiary', array: tertiaryArray },
  ],
  showErrors: true,
};

export const IgnoreValue = Template.bind({});
IgnoreValue.args = {
  ...Default.args,
  ignoreValue: (val) => val % 5 === 0,
};

export const TypedArrays = Template.bind({});
TypedArrays.args = {
  dataArray: toTypedNdArray(primaryArray, Float32Array),
  errorsArray: toTypedNdArray(errorsArray, Float32Array),
  auxiliaries: [
    { label: 'secondary', array: toTypedNdArray(secondaryArray, Float32Array) },
  ],
  showErrors: true,
};

export { Template as LineVisTemplate };
export default {
  title: 'Visualizations/LineVis',
  component: LineVis,
  excludeStories: ['LineVisTemplate'],
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
