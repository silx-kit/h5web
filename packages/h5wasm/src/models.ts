import type { Shape } from '@h5web/shared';
import type {
  BrokenSoftLink as H5WasmBrokenSoftLink,
  Dataset as H5WasmDataset,
  ExternalLink as H5WasmExternalLink,
  Group as H5WasmGroup,
} from 'h5wasm';

export type H5WasmEntity =
  | H5WasmBrokenSoftLink
  | H5WasmExternalLink
  | H5WasmGroup
  | H5WasmDataset;

export interface H5WasmAttribute {
  value: unknown;
  shape: Shape;
  dtype: string;
}
