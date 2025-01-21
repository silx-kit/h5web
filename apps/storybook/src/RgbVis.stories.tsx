import { ImageType, mockValues, RgbVis } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const rgbThreeD = mockValues.threeD_rgb();

const meta = {
  title: 'Visualizations/RgbVis',
  component: RgbVis,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    dataArray: rgbThreeD,
    aspect: 'equal',
    showGrid: true,
  },
  argTypes: {
    dataArray: { control: false },
    aspect: {
      control: { type: 'inline-radio' },
      options: ['auto', 'equal', 0.25],
    },
  },
} satisfies Meta<typeof RgbVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const BGR = {
  args: {
    imageType: ImageType.BGR,
  },
} satisfies Story;

export const AxisValues = {
  args: {
    abscissaParams: {
      value: Array.from(
        { length: rgbThreeD.shape[1] }, // works even when right edge of last pixel is not provided
        (_, i) => 100 + 10 * i,
      ),
    },
    ordinateParams: {
      value: Array.from(
        { length: rgbThreeD.shape[0] + 1 },
        (_, i) => -100 + 10 * i,
      ),
    },
  },
} satisfies Story;

export const DescendingAxisValues = {
  args: {
    abscissaParams: {
      value: Array.from(
        { length: rgbThreeD.shape[1] }, // works even when right edge of last pixel is not provided
        (_, i) => -100 - 10 * i,
      ),
    },
    ordinateParams: {
      value: Array.from(
        { length: rgbThreeD.shape[0] + 1 },
        (_, i) => -100 - 10 * i,
      ),
    },
  },
} satisfies Story;

export const TypedArray = {
  args: {
    dataArray: mockValues.int8_rgb(),
  },
} satisfies Story;

export const ChangeInteractionKeys = {
  args: {
    interactions: {
      pan: { modifierKey: 'Shift' },
      selectToZoom: { modifierKey: 'Control' },
    },
  },
} satisfies Story;

export const AutoAspectRatio = {
  args: {
    aspect: 'auto',
  },
} satisfies Story;

export const CustomAspectRatio = {
  args: {
    aspect: 0.25,
  },
} satisfies Story;

export const FlipXAxis = {
  args: {
    dataArray: rgbThreeD,
    flipXAxis: true,
  },
} satisfies Story;

export const FlipYAxis = {
  args: {
    dataArray: rgbThreeD,
    flipYAxis: true,
  },
} satisfies Story;

export const NoGrid = {
  args: {
    showGrid: false,
  },
} satisfies Story;

export const WithTitle = {
  args: {
    title: 'RGB image',
  },
} satisfies Story;
