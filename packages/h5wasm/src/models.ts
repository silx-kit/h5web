import type { Group as H5WasmGroup, Metadata } from 'h5wasm';

export type H5WasmEntity = NonNullable<ReturnType<H5WasmGroup['get']>>;

export type H5WasmAttributes = H5WasmGroup['attrs'];

interface CompoundMember extends Metadata {
  name: string;
  offset: number;
}

interface CompoundTypeMetadata {
  members: CompoundMember[];
  nmembers: number;
}

export interface CompoundMetadata extends Metadata {
  compound_type: CompoundTypeMetadata;
}

export interface NumericMetadata extends Metadata {
  type: 0 | 1;
}
