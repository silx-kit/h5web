import type { Meta, Story } from '@storybook/react/types-6-0';
import type { H5WebComplex } from '@h5web/shared';
import { formatMatrixComplex, formatMatrixValue } from '@h5web/shared';
import type { MatrixVisProps } from '@h5web/lib';
import { getMockDataArray, MatrixVis } from '@h5web/lib';
import FillHeight from './decorators/FillHeight';

const Template: Story<MatrixVisProps> = (args) => <MatrixVis {...args} />;

export const Default = Template.bind({});

Default.args = {
  dataArray: getMockDataArray('/nD_datasets/twoD'),
  formatter: (val) => formatMatrixValue(val as number),
  cellWidth: 116,
};

export const Complex = Template.bind({});

Complex.args = {
  dataArray: getMockDataArray<H5WebComplex>('/nD_datasets/twoD_cplx'),
  formatter: (val) => formatMatrixComplex(val as H5WebComplex),
  cellWidth: 232,
};

export default {
  title: 'Visualizations/MatrixVis',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  component: MatrixVis,
} as Meta;
