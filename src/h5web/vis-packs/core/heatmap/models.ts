import type { Domain, ScaleType } from '../models';
import type { INTERPOLATORS } from './interpolators';

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

export type VisScaleType = Omit<ScaleType, 'gamma'> | [ScaleType.Gamma, number];
