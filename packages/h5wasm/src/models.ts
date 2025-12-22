export interface HDF5Diag {
  major: string;
  minor: string;
  message: string;
  origin: string;
}

// https://github.com/h5wasm/h5wasm-plugins#included-plugins
export enum Plugin {
  Bitgroom = 'bitgroom',
  Bitround = 'bitround',
  Bitshuffle = 'bshuf',
  Blosc = 'blosc',
  Blosc2 = 'blosc2',
  BZIP2 = 'bz2',
  JPEG = 'jpeg',
  LZ4 = 'lz4',
  LZF = 'lzf',
  ZFP = 'zfp',
  Zstandard = 'zstd',
}
