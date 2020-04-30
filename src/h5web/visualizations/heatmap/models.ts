import { ScaleLinear, ScaleSymLog } from 'd3-scale';
import { INTERPOLATORS } from './interpolators';

export type Dims = [number, number];

export type Domain = [number, number];

export type AxisOffsets = [number, number];

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export type DataScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;
