import type { PickD3Scale } from '@visx/scale';
import type {
  NumericType,
  StringType,
  BooleanType,
  ComplexType,
  NumberOrNaN,
} from '../../providers/models';

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  SymLog = 'symlog',
}

export interface Size {
  width: number;
  height: number;
}

export type Bound = 'min' | 'max';
export type Domain = [number, number];
export type CustomDomain = [number | null, number | null]; // `null` for persistability

export interface DomainErrors {
  minGreater?: boolean;
  minError?: DomainError.InvalidMinWithLog | DomainError.CustomMaxFallback;
  maxError?: DomainError.InvalidMaxWithLog;
}

export enum DomainError {
  MinGreater = 'min-greater',
  InvalidMinWithLog = 'invalid-min-with-log',
  InvalidMaxWithLog = 'invalid-max-with-log',
  CustomMaxFallback = 'custom-max-fallback',
}

export interface AxisConfig {
  isIndexAxis?: boolean;
  domain: Domain;
  showGrid?: boolean;
  scaleType?: ScaleType;
  label?: string;
}

export type AxisScale = PickD3Scale<
  ScaleType.Linear | ScaleType.Log | ScaleType.SymLog,
  number,
  number
>;

export interface AxisOffsets {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

export interface AxisParams {
  label?: string;
  value?: NumberOrNaN[];
  scaleType?: ScaleType;
}

export type AxisMapping = (AxisParams | undefined)[];

export interface Bounds {
  min: number;
  max: number;
  positiveMin: number;
}

export type Coords = [number, number];
export type TooltipIndexFormatter = (t: Coords) => string;
export type TooltipValueFormatter = (t: Coords) => string | undefined;

export type PrintableType =
  | BooleanType
  | NumericType
  | ComplexType
  | StringType;
