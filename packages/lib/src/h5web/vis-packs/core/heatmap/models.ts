import type { INTERPOLATORS } from './interpolators';
import type { Domain } from '../models';

export interface Dims {
  rows: number;
  cols: number;
}

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export type Layout = 'contain' | 'cover' | 'fill';

export interface TooltipData {
  abscissa: number;
  ordinate: number;
  xi: number;
  yi: number;
  x: number;
  y: number;
}

export interface ScaleShader {
  uniforms: (
    domain: Domain,
    exponent?: number
  ) => Record<string, { value: number }>;
  fragment: string;
}
