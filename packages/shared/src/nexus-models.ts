import { type ScaleType } from './vis-models';

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
  RGB = 'rgb-image',
}

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: AxisMapping<ScaleType>;
}

export type AxisMapping<T> = (T | undefined)[];
