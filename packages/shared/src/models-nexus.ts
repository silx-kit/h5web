import type { ScaleType } from './models-vis';

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
  RGB = 'rgb-image',
}

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}
