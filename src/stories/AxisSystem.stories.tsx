import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import VisCanvas, {
  VisCanvasProps,
} from '../h5web/visualizations/shared/VisCanvas';
import { ScaleType } from '../h5web/visualizations/shared/models';

const Template: Story<VisCanvasProps> = (args): ReactElement => (
  <VisCanvas {...args}>
    <></>
  </VisCanvas>
);

export const IndexDomains = Template.bind({});

IndexDomains.args = {
  abscissaConfig: { indexDomain: [0, 3], showGrid: true },
  ordinateConfig: { indexDomain: [50, 100], showGrid: true },
};

export const DataDomains = Template.bind({});

DataDomains.args = {
  abscissaConfig: { dataDomain: [0, 3], showGrid: true },
  ordinateConfig: { dataDomain: [50, 100], showGrid: true },
};

export const LogScales = Template.bind({});

LogScales.args = {
  abscissaConfig: {
    dataDomain: [1, 10],
    showGrid: true,
    scaleType: ScaleType.Log,
  },
  ordinateConfig: {
    dataDomain: [-10, 10],
    showGrid: true,
    scaleType: ScaleType.SymLog,
  },
};

export const AspectRatio = Template.bind({});

AspectRatio.args = {
  abscissaConfig: { indexDomain: [0, 10], showGrid: true },
  ordinateConfig: { indexDomain: [0, 1], showGrid: true },
  aspectRatio: 10,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  abscissaConfig: { indexDomain: [-5, 20] },
  ordinateConfig: { dataDomain: [0, 1] },
};

export default {
  title: 'VisCanvas/AxisSystem',
  component: VisCanvas,
};
