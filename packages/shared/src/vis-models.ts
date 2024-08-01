import type { NdArray, TypedArray } from 'ndarray';

import type { DType, Primitive } from './hdf5-models';

export type NumArray = TypedArray | number[];
export type AnyNumArray = NdArray<NumArray> | NumArray;

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export type Domain = [min: number, max: number];
export type Axis = 'x' | 'y';

export interface VisibleDomains {
  xVisibleDomain: Domain;
  yVisibleDomain: Domain;
}

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  SymLog = 'symlog',
  Sqrt = 'sqrt',
  Gamma = 'gamma',
}

export type ColorScaleType = Exclude<ScaleType, 'gamma'>;
export type AxisScaleType = Exclude<ScaleType, 'sqrt' | 'gamma'>;

export enum ComplexVisType {
  Phase = 'phase',
  Amplitude = 'amplitude',
  PhaseAmplitude = 'phase-amplitude',
}
export type ComplexLineVisType = Exclude<ComplexVisType, 'phase-amplitude'>;

export interface Bounds {
  min: number;
  max: number;
  positiveMin: number;
  strictPositiveMin: number;
}

export interface Dims {
  rows: number;
  cols: number;
}

// MappedTuple<string[]> => string[]
// MappedTuple<number[]> => number[]
// MappedTuple<number[], string> => string[]
// MappedTuple<[number, number]> => [number, number]
// MappedTuple<[number, number], string> => [string, string]
export type MappedTuple<T extends unknown[], U = T[number]> = {
  [index in keyof T]: U;
};

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;
