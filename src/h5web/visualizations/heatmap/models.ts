import type { scaleSymlog, scaleLinear } from 'd3-scale';
import type { INTERPOLATORS } from './interpolators';

export type Dims = {
  rows: number;
  cols: number;
};

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export type ColorMapOption = {
  label: ColorMap;
  value: ColorMap;
};

export type DataScaleFn = typeof scaleSymlog | typeof scaleLinear;
