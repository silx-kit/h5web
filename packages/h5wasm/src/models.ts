import type { Shape } from '@h5web/shared';
import type { Group as H5WasmGroup } from 'h5wasm';

export type H5WasmEntity = NonNullable<ReturnType<H5WasmGroup['get']>>;

export interface H5WasmAttribute {
  value: unknown;
  shape: Shape;
  dtype: string;
}
