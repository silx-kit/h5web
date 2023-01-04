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

// MappedTupple<number[], string> => string[]
// MappedTupple<[number, number], string> => [string, string]
export type MappedTuple<T, U> = { [index in keyof T]: U };
