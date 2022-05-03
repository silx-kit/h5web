import type { Group as H5WasmGroup } from 'h5wasm';

export type H5WasmEntity = NonNullable<ReturnType<H5WasmGroup['get']>>;

export type H5WasmAttributes = H5WasmGroup['attrs'];
