import type { Group as H5WasmGroup, Metadata } from 'h5wasm';
import type {
  CompoundTypeMetadata,
  EnumTypeMetadata,
} from 'h5wasm/src/hdf5_util_helpers';

export type H5WasmEntity = ReturnType<H5WasmGroup['get']>;

export type H5WasmAttributes = H5WasmGroup['attrs'];

export interface CompoundMetadata extends Metadata {
  compound_type: CompoundTypeMetadata;
}

export interface NumericMetadata extends Metadata {
  type: 0 | 1;
}

export interface EnumMetadata extends Metadata {
  enum_type: EnumTypeMetadata;
}
