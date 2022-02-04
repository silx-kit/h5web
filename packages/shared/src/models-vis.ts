import type { NdArray, TypedArray } from 'ndarray';

export type NumArray = TypedArray | number[];
export type AnyNumArray = NdArray<NumArray> | NumArray;

export type Domain = [number, number];

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
