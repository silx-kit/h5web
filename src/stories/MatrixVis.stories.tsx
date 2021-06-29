import type { Meta, Story } from '@storybook/react/types-6-0';
import type { H5WebComplex } from '../h5web/providers/models';
import { formatNumber } from '../h5web/vis-packs/core/utils';
import { getMockDataArray, MatrixVis, MatrixVisProps } from '../packages/lib';
import FillHeight from './decorators/FillHeight';

const Template: Story<MatrixVisProps> = (args) => <MatrixVis {...args} />;

export const Default = Template.bind({});

Default.args = {
  dataArray: getMockDataArray('/nD_datasets/twoD'),
  formatter: (val) => formatNumber(val as number),
  cellWidth: 100,
};

export const Complex = Template.bind({});

Complex.args = {
  dataArray: getMockDataArray<H5WebComplex>('/nD_datasets/twoD_cplx'),
  formatter: (val) => `real = ${formatNumber((val as H5WebComplex)[0])}`,
  cellWidth: 180,
};

export default {
  title: 'Visualizations/MatrixVis',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  component: MatrixVis,
} as Meta;
