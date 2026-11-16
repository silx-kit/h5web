import { type INTERPOLATORS } from './interpolators';

export type D3Interpolator = (t: number) => string;

export type ColorMap = keyof typeof INTERPOLATORS;

export interface TooltipData {
  abscissa: number;
  ordinate: number;
  xi: number;
  yi: number;
  x: number;
  y: number;
}

export type TextureSafeTypedArray =
  Float32Array | Uint8Array | Uint8ClampedArray | Uint16Array; // uint16 values are treated as half floats

export interface ChunkRange {
  start: number;
  end: number;
  texStart: number; // includes overlapping texel, if any
  texEnd: number;
}

export interface TextureChunk {
  rows: ChunkRange;
  cols: ChunkRange;
}

export interface ChunkBounds {
  x: [number, number];
  y: [number, number];
  u: [number, number];
  v: [number, number];
}
