import type { Story } from '@storybook/react/types-6-0';
import FillHeight from './decorators/FillHeight';
import { VisCanvas, AxisSystemProps, ScaleType } from '../packages/lib';
import AxisSystem from '../h5web/vis-packs/core/shared/AxisSystem';
import { getAxisOffsets } from '../h5web/vis-packs/core/utils';

const Template: Story<{ aspectRatio?: number } & AxisSystemProps> = ({
  aspectRatio,
  ...args
}) => {
  const axisOffsets = getAxisOffsets();

  return (
    <VisCanvas axisOffsets={axisOffsets} aspectRatio={aspectRatio}>
      <AxisSystem {...args} axisOffsets={axisOffsets} />
    </VisCanvas>
  );
};

export const IndexDomains = Template.bind({});

IndexDomains.args = {
  abscissaConfig: { domain: [0, 3], showGrid: true, isIndexAxis: true },
  ordinateConfig: { domain: [50, 100], showGrid: true, isIndexAxis: true },
};

export const ArbitraryDomains = Template.bind({});

ArbitraryDomains.args = {
  abscissaConfig: { domain: [0, 3], showGrid: true },
  ordinateConfig: { domain: [50, 100], showGrid: true },
};

export const LogScales = Template.bind({});

LogScales.args = {
  abscissaConfig: {
    domain: [1, 10],
    showGrid: true,
    scaleType: ScaleType.Log,
  },
  ordinateConfig: {
    domain: [-10, 10],
    showGrid: true,
    scaleType: ScaleType.SymLog,
  },
};

export const AspectRatio = Template.bind({});

AspectRatio.args = {
  abscissaConfig: { domain: [0, 10], showGrid: true, isIndexAxis: true },
  ordinateConfig: { domain: [0, 2], showGrid: true, isIndexAxis: true },
  aspectRatio: 10 / 2,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  abscissaConfig: { domain: [-5, 20], showGrid: false, isIndexAxis: true },
  ordinateConfig: { domain: [0, 2], showGrid: false },
};

export const AxesLabels = Template.bind({});

AxesLabels.args = {
  abscissaConfig: { domain: [0, 3], showGrid: true, label: 'Abscissas' },
  ordinateConfig: { domain: [50, 100], showGrid: true, label: 'Ordinates' },
};

export const GraphTitle = Template.bind({});

GraphTitle.args = {
  abscissaConfig: { domain: [0, 3], showGrid: true, isIndexAxis: true },
  ordinateConfig: { domain: [50, 100], showGrid: true, isIndexAxis: true },
  title: 'This is a graph',
};

export const InheritedStyles = Template.bind({});

InheritedStyles.args = {
  abscissaConfig: {
    domain: [0, 50],
    showGrid: true,
    isIndexAxis: true,
    label: 'X values',
  },
  ordinateConfig: {
    domain: [0, 3],
    showGrid: true,
    isIndexAxis: true,
    label: 'Y values',
  },
  title: 'The title',
};

InheritedStyles.decorators = [
  (VisCanvasStory: Story) => (
    <div
      style={{
        flex: '1 1 0%',
        display: 'flex',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '1.125rem',
      }}
    >
      <VisCanvasStory />
    </div>
  ),
];

export default {
  title: 'Building Blocks/VisCanvas',
  component: VisCanvas,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
};
