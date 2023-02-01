import type { NdArray, TypedArray } from 'ndarray';

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

export type Domain = [number, number];
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

// MappedTupple<number[]> => number[]
// MappedTupple<number[], string> => string[]
// MappedTupple<[number, number]> => [number, number]
// MappedTupple<[number, number], string> => [string, string]
export type MappedTuple<T extends unknown[], U = T[number]> = {
  [index in keyof T]: U;
};
