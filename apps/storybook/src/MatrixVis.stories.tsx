import { getMockDataArray, MatrixVis } from '@h5web/lib';
import type { H5WebComplex } from '@h5web/shared';
import { createComplexFormatter, toTypedNdArray } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';
import { format } from 'd3-format';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const complexDataArray = getMockDataArray<H5WebComplex>(
  '/nD_datasets/twoD_cplx'
);

const formatMatrixValue = format('.3e');
const formatMatrixComplex = createComplexFormatter('.2e', true);

const meta = {
  title: 'Visualizations/MatrixVis',
  component: MatrixVis,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    cellWidth: 120,
  },
} satisfies Meta<typeof MatrixVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  args: {
    dataArray,
    formatter: (val) => formatMatrixValue(val as number),
  },
} satisfies Story;

export const CellWidth = {
  args: {
    ...Default.args,
    cellWidth: 250,
  },
} satisfies Story;

export const StaticHeaderCells = {
  args: {
    ...Default.args,
    sticky: false,
  },
} satisfies Story;

export const Complex = {
  args: {
    dataArray: complexDataArray,
    formatter: (val) => formatMatrixComplex(val as H5WebComplex),
    cellWidth: 232,
  },
} satisfies Story;

export const TypedArray = {
  args: {
    dataArray: toTypedNdArray(dataArray, Float32Array),
    formatter: (val) => formatMatrixValue(val as number),
  },
} satisfies Story;

export const ColumnHeaders = {
  args: {
    ...Default.args,
    columnHeaders: ['Column 1', 'Column 2'],
  },
} satisfies Story;
