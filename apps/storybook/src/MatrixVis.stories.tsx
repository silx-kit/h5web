import type { MatrixVisProps } from '@h5web/lib';
import { getMockDataArray, MatrixVis } from '@h5web/lib';
import type { H5WebComplex } from '@h5web/shared';
import {
  toTypedNdArray,
  formatMatrixComplex,
  formatMatrixValue,
} from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const complexDataArray = getMockDataArray<H5WebComplex>(
  '/nD_datasets/twoD_cplx'
);

const Template: Story<MatrixVisProps> = (args) => <MatrixVis {...args} />;

export const Default = Template.bind({});
Default.args = {
  dataArray,
  formatter: (val) => formatMatrixValue(val as number),
};

export const Complex = Template.bind({});
Complex.args = {
  dataArray: complexDataArray,
  formatter: (val) => formatMatrixComplex(val as H5WebComplex),
  cellWidth: 232,
};

export const TypedArray = Template.bind({});
TypedArray.args = {
  dataArray: toTypedNdArray(dataArray, Float32Array),
  formatter: (val) => formatMatrixValue(val as number),
};

export const StaticIndexCells = Template.bind({});
StaticIndexCells.args = {
  dataArray,
  sticky: false,
  formatter: (val) => formatMatrixValue(val as number),
};

export default {
  title: 'Visualizations/MatrixVis',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  component: MatrixVis,
  args: { cellWidth: 116 },
} as Meta;
