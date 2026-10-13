import { getDomain, mockValues, SurfaceVis } from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { COLOR_SCALE_TYPES, ScaleType } from '@h5web/shared/vis-models';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import ndarray from 'ndarray';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const dataArray = createArrayFromView(mockValues.fourD().pick(0, 0));
const domain = getDomain(dataArray.data);
assertDefined(domain);

const [rows, cols] = dataArray.shape;
const abscissas = Float32Array.from({ length: cols }, (_, i) => -2 + i * 0.1);
const ordinates = Float32Array.from({ length: rows }, (_, i) => i ** 1.5);

const withHoles = ndarray(
  Float32Array.from(dataArray.data, (val, i) =>
    i % cols > cols / 3 && i % cols < cols / 2 ? Number.NaN : val,
  ),
  dataArray.shape,
);

const meta = preview.meta({
  title: 'Visualizations/SurfaceVis',
  component: SurfaceVis,
  decorators: [FillHeight],
  args: {
    dataArray,
    domain,
  },
  argTypes: {
    dataArray: { control: false },
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
  },
});

export const Default = meta.story();

export const AxisValues = meta.story({
  args: {
    title: 'With axis values',
    abscissaParams: { value: abscissas },
    ordinateParams: { value: ordinates },
  },
});

// Positive data spanning five orders of magnitude: three Gaussian peaks over a low background
function peak(x: number, y: number, params: [number, number, number, number]) {
  const [cx, cy, amp, width] = params;
  return amp * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * width ** 2));
}

const peaksArray = ndarray(
  Float32Array.from({ length: 80 * 120 }, (_, i) => {
    const x = (i % 120) / 120;
    const y = Math.floor(i / 120) / 80;
    return (
      1e-4 +
      peak(x, y, [0.3, 0.4, 1, 0.08]) +
      peak(x, y, [0.7, 0.6, 0.05, 0.06]) +
      peak(x, y, [0.55, 0.2, 0.003, 0.05])
    );
  }),
  [80, 120],
);

export const LogScale = meta.story({
  args: {
    title: 'Peaks (log scale)',
    dataArray: peaksArray,
    domain: getDomain(peaksArray.data, { scaleType: ScaleType.Log }),
    scaleType: ScaleType.Log,
  },
});

export const NaNHoles = meta.story({
  name: 'With NaN',
  args: {
    dataArray: withHoles,
  },
});
