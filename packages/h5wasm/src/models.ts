import type { Group as H5WasmGroup } from 'h5wasm';

export type H5WasmEntity = ReturnType<H5WasmGroup['get']>;

export type H5WasmAttributes = H5WasmGroup['attrs'];

export interface HDF5Diag {
  major: string;
  minor: string;
  message: string;
  origin: string;
}
