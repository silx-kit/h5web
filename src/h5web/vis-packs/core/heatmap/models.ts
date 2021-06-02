import type { INTERPOLATORS } from './interpolators';

export interface Dims {
  rows: number;
  cols: number;
}

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export type Layout = 'contain' | 'cover' | 'fill';
