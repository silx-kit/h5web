export type NxAttribute =
  | 'signal'
  | 'interpretation'
  | 'axes'
  | 'default'
  | 'long_name'
  | 'units';

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
}

export const NX_INTERPRETATIONS = Object.values<string>(NxInterpretation);
