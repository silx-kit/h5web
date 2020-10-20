export type NxAttribute = 'signal' | 'interpretation';

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
}

export const NX_INTERPRETATIONS = Object.values<string>(NxInterpretation);
