import type { INTERPOLATORS } from './interpolators';

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export type Layout = 'cover' | 'fill';

export interface TooltipData {
  abscissa: number;
  ordinate: number;
  xi: number;
  yi: number;
  x: number;
  y: number;
}

export type TextureSafeTypedArray =
  | Float32Array
  | Uint8Array
  | Uint8ClampedArray;
