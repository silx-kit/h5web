import type { PickD3Scale } from '@visx/scale';
import type {
  NumericType,
  StringType,
  BooleanType,
  ComplexType,
  DType,
  Primitive,
} from '../../providers/models';

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  SymLog = 'symlog',
  Sqrt = 'sqrt',
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

export type AxisScale = PickD3Scale<
  ScaleType.Linear | ScaleType.Log | ScaleType.SymLog | ScaleType.Sqrt,
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
  value?: number[];
  scaleType?: ScaleType;
}

export type AxisMapping = (AxisParams | undefined)[];

export interface Bounds {
  min: number;
  max: number;
  positiveMin: number;
}

export type Coords = [number, number];

export type PrintableType =
  | BooleanType
  | NumericType
  | ComplexType
  | StringType;

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';

export interface HistogramData {
  data: number[];
  bins: number[];
}
