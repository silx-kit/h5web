import {
  CurveType,
  getCombinedDomain,
  getDomain,
  getDomains,
  LineVis,
  mockValues,
  ScaleType,
} from '@h5web/lib';
import {
  AXIS_SCALE_TYPES,
  createArrayFromView,
  toTypedNdArray,
} from '@h5web/shared/vis-utils';
import type { Meta, StoryObj } from '@storybook/react';
import ndarray from 'ndarray';

import FillHeight from './decorators/FillHeight';

const dataArray = mockValues.oneD_linear();

const primaryArray = createArrayFromView(mockValues.twoD().pick(0));
const secondaryArray = createArrayFromView(mockValues.secondary().pick(0));
const tertiaryArray = createArrayFromView(mockValues.tertiary().pick(0));

const abscissas = Array.from(
  { length: dataArray.size },
  (_, i) => -10 + 0.5 * i,
);
const errorsArray = ndarray(
  Array.from({ length: dataArray.size }, (_, i) => Math.abs(10 - 0.5 * i)),
  dataArray.shape,
);

const meta = {
  title: 'Visualizations/LineVis',
  component: LineVis,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    dataArray,
    domain: undefined, // compute dynamically in each story based on scale type, errors and auxiliaries
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
      options: AXIS_SCALE_TYPES,
    },
  },
} satisfies Meta<typeof LineVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { dataArray, domain, scaleType, errorsArray, auxiliaries } = args;

    // If story doesn't provide `domain`, compute it automatically
    const auxArrays = (auxiliaries || []).map(({ array }) => array);
    const effectiveDomain =
      domain ||
      getCombinedDomain([
        getDomain(dataArray, scaleType, errorsArray),
        ...getDomains(auxArrays, scaleType),
      ]);

    return <LineVis {...args} domain={effectiveDomain} />;
  },
} satisfies Story;

export const Domain = {
  ...Default,
  args: {
    domain: [1, 20], // compatible with all scale types
  },
} satisfies Story;

export const Abscissas = {
  ...Default,
  args: {
    abscissaParams: {
      value: abscissas,
    },
  },
} satisfies Story;

export const DescendingAbscissas = {
  ...Default,
  args: {
    abscissaParams: {
      value: [...abscissas].reverse(),
    },
  },
} satisfies Story;

export const ErrorBars = {
  ...Default,
  args: {
    errorsArray,
    showErrors: true,
  },
} satisfies Story;

export const AuxiliaryArrays = {
  ...Default,
  args: {
    dataArray: primaryArray,
    auxiliaries: [
      { label: 'secondary', array: secondaryArray },
      { label: 'tertiary', array: tertiaryArray },
    ],
  },
} satisfies Story;

export const AuxiliaryErrors = {
  ...Default,
  args: {
    dataArray: primaryArray,
    errorsArray,
    auxiliaries: [
      { label: 'secondary', array: secondaryArray, errors: errorsArray },
      { label: 'tertiary', array: tertiaryArray },
    ],
    showErrors: true,
  },
} satisfies Story;

export const TypedArrays = {
  ...Default,
  args: {
    dataArray: toTypedNdArray(primaryArray, Float32Array),
    errorsArray: toTypedNdArray(errorsArray, Float32Array),
    auxiliaries: [
      {
        label: 'secondary',
        array: toTypedNdArray(secondaryArray, Float32Array),
      },
    ],
    showErrors: true,
  },
} satisfies Story;

export const IgnoreValue = {
  ...Default,
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
} satisfies Story;
