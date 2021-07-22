import type { Meta, Story } from '@storybook/react/types-6-0';
import type { VisCanvasProps } from '../h5web/vis-packs/core/shared/VisCanvas';
import FillHeight from './decorators/FillHeight';
import { VisCanvas, ScaleType } from '../packages/lib';

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

export const AspectRatio = Template.bind({});
AspectRatio.args = {
  abscissaConfig: { visDomain: [0, 16], showGrid: true, isIndexAxis: true },
  ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
  aspectRatio: 16 / 10,
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
