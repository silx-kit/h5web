import { ImageType, mockValues, RgbVis } from '@h5web/lib';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const rgbThreeD = mockValues.threeD_rgb();

const meta = preview.meta({
  title: 'Visualizations/RgbVis',
  component: RgbVis,
  decorators: [FillHeight],
  argTypes: {
    dataArray: { control: false },
    aspect: {
      control: { type: 'inline-radio' },
      options: ['auto', 'equal', 0.25, undefined],
    },
    imageType: {
      control: { type: 'inline-radio' },
      options: ['RGB', 'BGR', undefined],
    },
  },
});

export const Default = meta.story({
  args: {
    dataArray: rgbThreeD,
    showGrid: true,
  },
});

export const BGR = Default.extend({
  args: {
    imageType: ImageType.BGR,
  },
});

export const AxisValues = Default.extend({
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
});

export const DescendingAxisValues = Default.extend({
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
});

export const TypedArray = Default.extend({
  args: {
    dataArray: mockValues.int8_rgb(),
  },
});

export const ChangeInteractionKeys = Default.extend({
  args: {
    interactions: {
      pan: { modifierKey: 'Shift' },
    },
  },
});

export const AutoAspectRatio = Default.extend({
  args: {
    aspect: 'auto',
  },
});

export const CustomAspectRatio = Default.extend({
  args: {
    aspect: 0.25,
  },
});

export const FlipXAxis = Default.extend({
  args: {
    dataArray: rgbThreeD,
    flipXAxis: true,
  },
});

export const FlipYAxis = Default.extend({
  args: {
    dataArray: rgbThreeD,
    flipYAxis: true,
  },
});

export const NoGrid = Default.extend({
  args: {
    showGrid: false,
  },
});

export const WithTitle = Default.extend({
  args: {
    title: 'RGB image',
  },
});
