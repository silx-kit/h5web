import { ScaleType, VisCanvas } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { format } from 'd3-format';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/VisCanvas',
  component: VisCanvas,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof VisCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IndexDomains = {
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
  },
} satisfies Story;

export const ArbitraryDomains = {
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true },
  },
} satisfies Story;

export const NiceDomains = {
  args: {
    abscissaConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: true },
    ordinateConfig: { visDomain: [-1.2, 2.8], showGrid: true, nice: false },
  },
} satisfies Story;

export const TickFormatters = {
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
} satisfies Story;

export const LogScales = {
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
} satisfies Story;

export const EqualAspectRatio = {
  args: {
    abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
    aspect: 'equal',
  },
} satisfies Story;

export const CustomAspectRatio = {
  args: {
    abscissaConfig: { visDomain: [0, 20], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 10], showGrid: true, isIndexAxis: true },
    aspect: 2,
  },
} satisfies Story;

export const NoGrid = {
  args: {
    abscissaConfig: { visDomain: [-5, 20], showGrid: false, isIndexAxis: true },
    ordinateConfig: { visDomain: [0, 2], showGrid: false },
  },
} satisfies Story;

export const Title = {
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, isIndexAxis: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, isIndexAxis: true },
    title: 'This is a graph',
  },
} satisfies Story;

export const AxisLabels = {
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, label: 'Abscissas' },
    ordinateConfig: {
      visDomain: [50, 100],
      showGrid: true,
      label: 'Ordinates',
    },
  },
} satisfies Story;

export const FlippedAxes = {
  args: {
    abscissaConfig: { visDomain: [0, 3], showGrid: true, flip: true },
    ordinateConfig: { visDomain: [50, 100], showGrid: true, flip: true },
  },
} satisfies Story;

export const NoAxes = {
  args: {
    abscissaConfig: { visDomain: [-5, 20], showGrid: true },
    ordinateConfig: { visDomain: [0, 2], showGrid: true },
    showAxes: false,
  },
} satisfies Story;

export const InheritedStyles = {
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
    (VisCanvasStory) => (
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
  ],
} satisfies Story;
