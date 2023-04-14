import { ScaleType, VisCanvas, type VisCanvasProps } from '@h5web/lib';
import { type Meta, type Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

const Template: Story<VisCanvasProps> = (args) => <VisCanvas {...args} />;

export const IndexDomains = Template.bind({});
IndexDomains.args = {
  abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
  ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
};

export const ArbitraryDomains = Template.bind({});
ArbitraryDomains.args = {
  abscissaConfig: { visDomain: [0, 3], showGrid: true },
  ordinateConfig: { visDomain: [50, 100], showGrid: true },
};

export const NiceDomains = Template.bind({});
NiceDomains.args = {
  abscissaConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: true },
  ordinateConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: false },
};

export const LogScales = Template.bind({});
LogScales.args = {
  abscissaConfig: {
    visDomain: [1, 10],
    showGrid: true,
    scaleType: ScaleType.Log,
  },
  ordinateConfig: {
    visDomain: [-10, 10],
    showGrid: true,
    scaleType: ScaleType.SymLog,
  },
};

export const EqualAspectRatio = Template.bind({});
EqualAspectRatio.args = {
  abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
  ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
  aspect: 'equal',
};

export const CustomAspectRatio = Template.bind({});
CustomAspectRatio.args = {
  abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
  ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
  aspect: 2,
};

export const NoGrid = Template.bind({});
NoGrid.args = {
  abscissaConfig: { visDomain: [-5, 20], showGrid: false, isIndexAxis: true },
  ordinateConfig: { visDomain: [0, 2], showGrid: false },
};

export const Title = Template.bind({});
Title.args = {
  abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
  ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
  title: 'This is a graph',
};

export const AxisLabels = Template.bind({});
AxisLabels.args = {
  abscissaConfig: { visDomain: [0, 3], showGrid: true, label: 'Abscissas' },
  ordinateConfig: { visDomain: [50, 100], showGrid: true, label: 'Ordinates' },
};

export const FlippedAxes = Template.bind({});
FlippedAxes.args = {
  abscissaConfig: { visDomain: [0, 3], showGrid: true, flip: true },
  ordinateConfig: { visDomain: [50, 100], showGrid: true, flip: true },
};

export const NoAxes = Template.bind({});
NoAxes.args = {
  abscissaConfig: { visDomain: [-5, 20], showGrid: true },
  ordinateConfig: { visDomain: [0, 2], showGrid: true },
  showAxes: false,
};

export const InheritedStyles = Template.bind({});

InheritedStyles.args = {
  abscissaConfig: {
    visDomain: [0, 50],
    showGrid: true,
    isIndexAxis: true,
    label: 'X values',
  },
  ordinateConfig: {
    visDomain: [0, 3],
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
} as Meta;
