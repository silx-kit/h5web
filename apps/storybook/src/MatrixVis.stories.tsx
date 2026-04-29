import { MatrixVis, mockValues } from '@h5web/lib';
import {
  createComplexFormatter,
  toTypedNdArray,
} from '@h5web/shared/vis-utils';
import { format } from 'd3-format';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const twoD = mockValues.twoD();
const typedTwoD = toTypedNdArray(twoD, Float32Array);
const cplxTwoD = mockValues.twoD_complex();

const formatNum = format('.3e');
const formatCplx = createComplexFormatter(format('.2e'));

const meta = preview.meta({
  title: 'Visualizations/MatrixVis',
  component: MatrixVis,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
});

export const Default = meta.story({
  args: {
    dims: twoD.shape,
    cellFormatter: (row, col) => formatNum(twoD.get(row, col)),
    cellWidth: 120,
  },
});

export const CellWidth = Default.extend({
  args: {
    cellWidth: 250,
  },
});

export const Complex = Default.extend({
  args: {
    dims: cplxTwoD.shape,
    cellFormatter: (row, col) => formatCplx(cplxTwoD.get(row, col)),
    cellWidth: 232,
  },
});

export const TypedArray = Default.extend({
  args: {
    dims: typedTwoD.shape,
    cellFormatter: (row, col) => formatNum(typedTwoD.get(row, col)),
  },
});

export const ColumnHeaders = Default.extend({
  args: {
    columnHeaders: ['Column 1', 'Column 2'],
  },
});
