import { INTERPOLATORS } from './interpolators';

export type Dims = [number, number];

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;
