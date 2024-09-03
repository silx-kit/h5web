import { MatrixVis, mockValues } from '@h5web/lib';
import {
  createComplexFormatter,
  toTypedNdArray,
} from '@h5web/shared/vis-utils';
import type { Meta, StoryObj } from '@storybook/react';
import { format } from 'd3-format';

import FillHeight from './decorators/FillHeight';

const dataArray = mockValues.twoD();
const typedDataArray = toTypedNdArray(dataArray, Float32Array);
const complexDataArray = mockValues.twoD_cplx();

const formatNum = format('.3e');
const formatCplx = createComplexFormatter('.2e', true);

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
    dims: dataArray.shape,
    cellFormatter: (row, col) => formatNum(dataArray.get(row, col)),
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
    dims: complexDataArray.shape,
    cellFormatter: (row, col) => formatCplx(complexDataArray.get(row, col)),
    cellWidth: 232,
  },
} satisfies Story;

export const TypedArray = {
  args: {
    dims: typedDataArray.shape,
    cellFormatter: (row, col) => formatNum(typedDataArray.get(row, col)),
  },
} satisfies Story;

export const ColumnHeaders = {
  args: {
    ...Default.args,
    columnHeaders: ['Column 1', 'Column 2'],
  },
} satisfies Story;
