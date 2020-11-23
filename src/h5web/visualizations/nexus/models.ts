import { AxisMapping, ScaleType, AxisParams } from '../shared/models';

export type NxAttribute =
  | 'NX_class'
  | 'signal'
  | 'interpretation'
  | 'axes'
  | 'default'
  | 'long_name'
  | 'units'
  | 'SILX_style';

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
}

interface SignalParams extends AxisParams {
  dims: number[];
}

export interface NxData {
  signal: SignalParams;
  errors?: number[];
  title?: string;
  axisMapping?: AxisMapping[];
}

export interface RawSilxStyle {
  signal_scale_type?: unknown;
  axes_scale_type?: unknown;
}

export interface SilxStyle {
  signal_scale_type?: ScaleType;
  axes_scale_type?: ScaleType[];
}
