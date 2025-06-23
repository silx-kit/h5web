import {
  type MaybeBigInt64Array,
  type MaybeBigUint64Array,
  type NdArray,
  type TypedArray,
} from 'ndarray';

import { type DType, type ScalarValue } from './hdf5-models';

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

export type BigIntTypedArray = MaybeBigInt64Array | MaybeBigUint64Array;
export type BigIntTypedArrayConstructor =
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;

export type Domain = [min: number, max: number];
export type Axis = 'x' | 'y';
export type DimensionMapping = (number | Axis)[];

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

export type IgnoreValue = (val: number) => boolean;

export interface ExportEntry {
  format: string;
  url: ExportURL;
}

export type ExportFormat = 'json' | 'csv' | 'npy' | 'tiff';
export type ExportURL = URL | (() => Promise<URL | Blob>);
export type BuiltInExporter = () => string;

// MappedTuple<string[]> => `string[]`
// MappedTuple<number[]> => `number[]`
// MappedTuple<number[], string> => `string[]`
// MappedTuple<[number, number]> => `[number, number]`
// MappedTuple<[number, number], string> => `[string, string]`
export type MappedTuple<T extends unknown[], U = T[number]> = {
  [index in keyof T]: U;
};

// ValueFormatter<StringType> => `(val: string) => string`
// ValueFormatter<NumericLikeType> => `(val: number) => string | (val: number | boolean) => string`
export type ValueFormatter<T extends DType> = T extends DType
  ? (val: ScalarValue<T>) => string
  : never;
