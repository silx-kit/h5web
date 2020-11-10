import { AxisMapping } from '../shared/models';

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

export interface NxData {
  signal: { label?: string; value?: number[]; dims: number[] };
  errors?: number[];
  title?: string;
  axisMapping?: AxisMapping[];
}
