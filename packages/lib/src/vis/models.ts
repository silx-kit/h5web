import type {
  BooleanType,
  ComplexType,
  Domain,
  NumArray,
  NumericType,
  ScaleType,
  StringType,
} from '@h5web/shared';
import type { PickD3Scale, PickScaleConfigWithoutType } from '@visx/scale';

import type { ColorMap } from './heatmap/models';
import type { ScaleGamma } from './scaleGamma';

export interface Size {
  width: number;
  height: number;
}

export type Aspect = 'auto' | 'equal' | number;

export type Bound = 'min' | 'max';
export type CustomDomain = [number | null, number | null]; // `null` for persistability

export interface DomainErrors {
  minGreater?: boolean;
  minError?: DomainError.InvalidMinWithScale | DomainError.CustomMaxFallback;
  maxError?: DomainError.InvalidMaxWithScale;
}

export enum DomainError {
  MinGreater = 'min-greater',
  InvalidMinWithScale = 'invalid-min-with-scale',
  InvalidMaxWithScale = 'invalid-max-with-scale',
  CustomMaxFallback = 'custom-max-fallback',
}

export interface AxisConfig {
  isIndexAxis?: boolean;
  visDomain: Domain;
  showGrid?: boolean;
  scaleType?: Exclude<ScaleType, 'sqrt' | 'gamma'>;
  label?: string;
  flip?: boolean;
  nice?: boolean;
}

export type VisScaleType =
  | Exclude<ScaleType, 'gamma'>
  | [ScaleType.Gamma, number];

export interface ScaleGammaConfig {
  domain?: Domain;
  range?: Domain;
  exponent?: number;
  clamp?: boolean;
}

export type ScaleConfig =
  | PickScaleConfigWithoutType<Exclude<ScaleType, 'gamma'>, number>
  | ScaleGammaConfig;

export type Scale =
  | PickD3Scale<Exclude<ScaleType, 'gamma'>, number>
  | ScaleGamma;

export interface AxisOffsets {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

export interface AxisParams {
  label?: string;
  value?: NumArray;
  scaleType?: Exclude<ScaleType, 'sqrt' | 'gamma'>;
}

export type Coords = [number, number];

export type PrintableType =
  | BooleanType
  | NumericType
  | ComplexType
  | StringType;

export interface HistogramParams {
  values: NumArray;
  bins: NumArray;
  showLeftAxis?: boolean;
  colorMap?: ColorMap;
  invertColorMap?: boolean;
}
