import type { PickD3Scale } from '@visx/scale';
import type {
  HDF5NumericType,
  HDF5StringType,
  HDF5BooleanType,
  HDF5ComplexType,
} from '../../providers/hdf5-models';

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
export type CustomDomain = [number | undefined, number | undefined];

export interface DomainErrors {
  minGreater: boolean;
  minError?: BoundError;
  maxError?: BoundError;
}

export enum BoundError {
  InvalidWithLog = 'invalid-with-log',
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
  value?: number[];
  scaleType?: ScaleType;
}

export type AxisMapping = (AxisParams | undefined)[];

export type Bounds = [number, number, number];

export type PrintableType =
  | HDF5NumericType
  | HDF5StringType
  | HDF5BooleanType
  | HDF5ComplexType;
