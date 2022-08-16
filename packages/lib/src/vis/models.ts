import type {
  Domain,
  NumericType,
  StringType,
  BooleanType,
  ComplexType,
  ScaleType,
  NumArray,
} from '@h5web/shared';
import type { PickD3Scale, PickScaleConfigWithoutType } from '@visx/scale';

import type { ColorMap } from './heatmap/models';
import type { ScaleGamma } from './scaleGamma';

export interface Size {
  width: number;
  height: number;
}

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
  scaleType?: ScaleType;
  label?: string;
  flip?: boolean;
}

export type VisxScaleConfig = PickScaleConfigWithoutType<
  ScaleType.Linear | ScaleType.Log | ScaleType.SymLog | ScaleType.Sqrt,
  number
>;

export type VisScaleType = Omit<ScaleType, 'gamma'> | [ScaleType.Gamma, number];

export interface ScaleGammaConfig {
  domain?: Domain;
  range?: Domain;
  exponent?: number;
  clamp?: boolean;
}

export type AxisScale =
  | PickD3Scale<
      ScaleType.Linear | ScaleType.Log | ScaleType.SymLog | ScaleType.Sqrt,
      number,
      number
    >
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
  scaleType?: ScaleType;
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
  colorMap?: ColorMap;
  invertColorMap?: boolean;
}

export interface CustomColor {
  property: `--h5w-${string}`;
  fallback: string;
}
