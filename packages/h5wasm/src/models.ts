import type { Group as H5WasmGroup } from 'h5wasm';

export type H5WasmEntity = ReturnType<H5WasmGroup['get']>;

export type H5WasmAttributes = H5WasmGroup['attrs'];

export interface HDF5Diag {
  major: string;
  minor: string;
  message: string;
  origin: string;
}

// https://github.com/h5wasm/h5wasm-plugins#included-plugins
export enum Plugin {
  Bitshuffle = 'bshuf',
  Blosc = 'blosc',
  Blosc2 = 'blosc2',
  BZIP2 = 'bz2',
  LZ4 = 'lz4',
  LZF = 'lzf',
  SZ = 'szf',
  ZFP = 'zfp',
  Zstandard = 'zstd',
}
