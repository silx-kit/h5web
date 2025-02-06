import {
  type AxisScaleType,
  type ColorScaleType,
  type Domain,
  type NumArray,
  type ScaleType,
} from '@h5web/shared/vis-models';
import { type PickD3Scale, type PickScaleConfigWithoutType } from '@visx/scale';
import { type HTMLAttributes } from 'react';

import { type ColorMap } from './heatmap/models';
import { type ScaleGamma } from './scaleGamma';

export interface Size {
  width: number;
  height: number;
}

export type Aspect = 'auto' | 'equal' | number;

export type Bound = 'min' | 'max';
export type CustomDomain = [min: number | null, max: number | null]; // `null` for persistability

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
  scaleType?: AxisScaleType;
  label?: string;
  flip?: boolean;
  nice?: boolean;
  formatTick?: (val: number) => string;
}

export type VisScaleType = ColorScaleType | [ScaleType.Gamma, number];
export type ExtractScaleType<V extends VisScaleType> = V extends ColorScaleType
  ? V
  : ScaleType.Gamma;

export interface ScaleGammaConfig {
  domain?: Domain;
  range?: Domain;
  exponent?: number;
  clamp?: boolean;
}

export type ScaleConfig<S = ScaleType> = S extends ColorScaleType
  ? PickScaleConfigWithoutType<S, number>
  : ScaleGammaConfig;

export type Scale<S = ScaleType> = S extends ColorScaleType
  ? PickD3Scale<S, number>
  : ScaleGamma;

export type AxisScale = Scale<AxisScaleType>;

export interface AxisOffsets {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

export interface AxisParams {
  label?: string;
  value?: NumArray;
  scaleType?: AxisScaleType;
}

export type Coords = [x: number, y: number];

export interface HistogramParams {
  values: NumArray;
  bins: NumArray;
  showLeftAxis?: boolean;
  colorMap?: ColorMap;
  invertColorMap?: boolean;
}

export type ClassStyleAttrs = Pick<
  HTMLAttributes<HTMLElement>,
  'className' | 'style'
>;
