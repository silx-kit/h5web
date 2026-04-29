import { ScaleType, VisCanvas } from '@h5web/lib';
import { format } from 'd3-format';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/VisCanvas',
  component: VisCanvas,
  decorators: [FillHeight],
});

export const IndexDomains = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
  },
});

export const ArbitraryDomains = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true },
  },
});

export const NiceDomains = meta.story({
  args: {
    abscissaConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: true },
    ordinateConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: false },
  },
});

export const TickFormatters = meta.story({
  args: {
    abscissaConfig: {
      visDomain: [-1.2, 2.8],
      showGrid: true,
      formatTick: (val) => {
        return Math.round(val) === val ? val.toString() : val.toFixed(3);
      },
    },
    ordinateConfig: {
      visDomain: [50, 100],
      showGrid: true,
      formatTick: format('.2e'),
    },
  },
});

export const LogScales = meta.story({
  args: {
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
  },
});

export const EqualAspectRatio = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
    aspect: 'equal',
  },
});

export const CustomAspectRatio = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
    aspect: 2,
  },
});

export const NoGrid = meta.story({
  args: {
    abscissaConfig: { visDomain: [-5, 20], showGrid: false, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 2], showGrid: false },
  },
});

export const Title = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
    title: 'This is a graph',
  },
});

export const AxisLabels = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, label: 'Abscissas' },
    ordinateConfig: {
      visDomain: [50, 100],
      showGrid: true,
      label: 'Ordinates',
    },
  },
});

export const FlippedAxes = meta.story({
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, flip: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, flip: true },
  },
});

export const NoAxes = meta.story({
  args: {
    abscissaConfig: { visDomain: [-5, 20], showGrid: true },
    ordinateConfig: { visDomain: [0, 2], showGrid: true },
    showAxes: false,
  },
});

export const InheritedStyles = meta.story({
  args: {
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
  },
  decorators: [
    (Story) => (
      <div
        style={{
          flex: '1 1 0%',
          display: 'flex',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '1.125rem',
        }}
      >
        <Story />
      </div>
    ),
  ],
});
