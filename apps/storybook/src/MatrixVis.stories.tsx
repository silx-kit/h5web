import { MatrixVis, mockValues } from '@h5web/lib';
import {
  createComplexFormatter,
  toTypedNdArray,
} from '@h5web/shared/vis-utils';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { format } from 'd3-format';

import FillHeight from './decorators/FillHeight';

const twoD = mockValues.twoD();
const typedTwoD = toTypedNdArray(twoD, Float32Array);
const cplxTwoD = mockValues.twoD_cplx();

const formatNum = format('.3e');
const formatCplx = createComplexFormatter(format('.2e'));

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
    dims: twoD.shape,
    cellFormatter: (row, col) => formatNum(twoD.get(row, col)),
  },
} satisfies Story;

export const CellWidth = {
  args: {
    ...Default.args,
    cellWidth: 250,
  },
} satisfies Story;

export const Complex = {
  args: {
    dims: cplxTwoD.shape,
    cellFormatter: (row, col) => formatCplx(cplxTwoD.get(row, col)),
    cellWidth: 232,
  },
} satisfies Story;

export const TypedArray = {
  args: {
    dims: typedTwoD.shape,
    cellFormatter: (row, col) => formatNum(typedTwoD.get(row, col)),
  },
} satisfies Story;

export const ColumnHeaders = {
  args: {
    ...Default.args,
    columnHeaders: ['Column 1', 'Column 2'],
  },
} satisfies Story;
