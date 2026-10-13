import {
  type Domain,
  type IgnoreValue,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { createArrayFromView, toTypedNdArray } from '@h5web/shared/vis-utils';
import { range } from 'd3-array';
import ndarray, { type NdArray } from 'ndarray';
import {
  BufferGeometry,
  ClampToEdgeWrapping,
  DataTexture,
  Float32BufferAttribute,
  FloatType,
  HalfFloatType,
  type MagnificationTextureFilter,
  type MinificationTextureFilter,
  NearestFilter,
  RedFormat,
  UnsignedByteType,
  UVMapping,
} from 'three';

import {
  type CustomDomain,
  DomainError,
  type DomainErrors,
  type Size,
} from '../models';
import { SCALES_VALID_MINS } from '../utils';
import { INTERPOLATORS } from './interpolators';
import {
  type ChunkBounds,
  type ChunkRange,
  type ColorMap,
  type D3Interpolator,
  type TextureChunk,
  type TextureSafeTypedArray,
} from './models';

const GRADIENT_PRECISION = 1 / 20;
export const GRADIENT_RANGE = range(
  0,
  1 + GRADIENT_PRECISION,
  GRADIENT_PRECISION,
);

const SCALE_FNS: Record<ScaleType, (val: number) => number> = {
  [ScaleType.Linear]: (val) => val,
  [ScaleType.Log]: Math.log10,
  [ScaleType.SymLog]: (val) => Math.sign(val) * Math.log10(1 + Math.abs(val)),
  [ScaleType.Sqrt]: Math.sqrt,
  [ScaleType.Gamma]: (val) => val,
};

const TEXTURE_TYPES = {
  float32: FloatType,
  uint16: HalfFloatType,
  uint8: UnsignedByteType,
  uint8_clamped: UnsignedByteType,
};

export function getVisDomain(
  customDomain: CustomDomain,
  dataDomain: Domain,
): Domain {
  return [customDomain[0] ?? dataDomain[0], customDomain[1] ?? dataDomain[1]];
}

export function getSafeDomain(
  domain: Domain,
  fallbackDomain: Domain,
  scaleType: ScaleType,
): [Domain, DomainErrors] {
  if (domain[0] > domain[1]) {
    return [fallbackDomain, { minGreater: true }];
  }

  const [min, max] = domain;
  const validMin = SCALES_VALID_MINS[scaleType];

  const isMinSupported = min >= validMin;
  const isMaxSupported = max >= validMin;

  const safeMin = isMinSupported ? min : fallbackDomain[0];
  const safeMax = isMaxSupported ? max : fallbackDomain[1];
  const safeMinGreater = safeMin > safeMax;

  return [
    [safeMinGreater ? safeMax : safeMin, safeMax],
    {
      minError: safeMinGreater
        ? DomainError.CustomMaxFallback
        : !isMinSupported
          ? DomainError.InvalidMinWithScale
          : undefined,
      maxError: !isMaxSupported ? DomainError.InvalidMaxWithScale : undefined,
    },
  ];
}

function getColorStops(
  interpolator: D3Interpolator,
  minMaxOnly: boolean,
): string {
  if (minMaxOnly) {
    const min = interpolator(0);
    const max = interpolator(1);
    return `${min}, ${min} 50%, ${max} 50%, ${max}`;
  }

  return GRADIENT_RANGE.map(interpolator).join(', ');
}

export function getLinearGradient(
  interpolator: D3Interpolator,
  direction: 'top' | 'bottom' | 'right' | 'left',
  minMaxOnly = false,
): string {
  const colorStops = getColorStops(interpolator, minMaxOnly);
  return `linear-gradient(to ${direction}, ${colorStops})`;
}

export function getPixelEdgeValues(
  rawValues: NumArray | undefined,
  pixelCount: number,
): NumArray {
  const pixelEdgeCount = pixelCount + 1;

  if (!rawValues) {
    return range(pixelEdgeCount);
  }

  if (rawValues.length < pixelCount) {
    throw new Error(`Expected array to have length ${pixelCount} at least`);
  }

  if (rawValues.length === pixelCount) {
    // Add value at right-hand side of last pixel, assuming raw values are regularly spaced
    const deltaCoord = rawValues[1] - rawValues[0];
    return [...rawValues, rawValues[rawValues.length - 1] + deltaCoord];
  }

  return rawValues.slice(0, pixelEdgeCount);
}

export function getInterpolator(
  colorMap: ColorMap,
  reverse: boolean,
): D3Interpolator {
  const interpolator = INTERPOLATORS[colorMap];
  return reverse ? (t: number) => interpolator(1 - t) : interpolator;
}

export function scaleDomain(
  domain: Domain,
  scaleType = ScaleType.Linear,
): Domain {
  const scaleFn = SCALE_FNS[scaleType];
  return [scaleFn(domain[0]), scaleFn(domain[1])];
}

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray>,
): NdArray<TextureSafeTypedArray>;

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined,
): NdArray<TextureSafeTypedArray> | undefined;

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined,
): NdArray<TextureSafeTypedArray> | undefined {
  if (!ndArr) {
    return undefined;
  }

  if (ndArr.dtype === 'float32' || ndArr.dtype.startsWith('uint8')) {
    return ndArr as NdArray<TextureSafeTypedArray>;
  }

  // Pass float16 through as uint16 without copying
  if (ndArr.data instanceof Float16Array) {
    const { buffer, byteOffset, length } = ndArr.data;
    return ndarray(new Uint16Array(buffer, byteOffset, length), ndArr.shape);
  }

  return toTypedNdArray(ndArr, Float32Array);
}

/*
 * Since the shader of `HeatmapMesh` works with floats and expects a texture with a
 * single colour channel (red), we are limited to using the RED texture format.
 *
 * In WebGL 2.0 (https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.6),
 * this format is compatible only with texture types FLOAT, HALF_FLOAT and UNSIGNED_BYTE,
 * which is why we support only Float32Array (FLOAT), Uint16Array (HALF_FLOAT) and
 * Uint8Array/Uint8ClampedArray (UNSIGNED_BYTE_TYPE).
 */
export function getDataTexture(
  values: NdArray<TextureSafeTypedArray>,
  magFilter?: MagnificationTextureFilter,
  minFilter?: MinificationTextureFilter,
): DataTexture;
export function getDataTexture(
  values: undefined,
  magFilter?: MagnificationTextureFilter,
  minFilter?: MinificationTextureFilter,
): undefined;
export function getDataTexture(
  values: NdArray<TextureSafeTypedArray> | undefined,
  magFilter?: MagnificationTextureFilter,
  minFilter?: MinificationTextureFilter,
): DataTexture | undefined;
export function getDataTexture(
  values: NdArray<TextureSafeTypedArray> | undefined,
  magFilter: MagnificationTextureFilter = NearestFilter,
  minFilter: MinificationTextureFilter = NearestFilter,
): DataTexture | undefined {
  if (!values) {
    return undefined;
  }
  const [rows, cols] = values.shape;

  const texture = new DataTexture(
    values.data,
    cols,
    rows,
    RedFormat,
    TEXTURE_TYPES[values.dtype],
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    magFilter,
    minFilter,
  );
  texture.needsUpdate = true;

  return texture;
}

function getChunkRanges(length: number, maxTextureSize: number): ChunkRange[] {
  if (length <= maxTextureSize) {
    return [{ start: 0, end: length, texStart: 0, texEnd: length }];
  }

  // Leave room for one overlapping texel on each side, so linear filtering doesn't show seams
  const chunkLength = Math.ceil(
    length / Math.ceil(length / (maxTextureSize - 2)),
  );

  return range(0, length, chunkLength).map((start) => {
    const end = Math.min(start + chunkLength, length);
    return {
      start,
      end,
      texStart: Math.max(start - 1, 0),
      texEnd: Math.min(end + 1, length),
    };
  });
}

/*
 * Split a 2D array of the given shape into evenly-sized chunks whose textures
 * (including overlapping texels) fit within the GPU's `MAX_TEXTURE_SIZE`.
 */
export function getTextureChunks(
  shape: number[],
  maxTextureSize: number,
): TextureChunk[] {
  const [rows, cols] = shape;
  const colRanges = getChunkRanges(cols, maxTextureSize);

  return getChunkRanges(rows, maxTextureSize).flatMap((rowRange) =>
    colRanges.map((colRange) => ({ rows: rowRange, cols: colRange })),
  );
}

export function sliceTextureChunk<T extends TextureSafeTypedArray>(
  values: NdArray<T>,
  chunk: TextureChunk,
): NdArray<T> {
  const { rows, cols } = chunk;
  const view = values
    .lo(rows.texStart, cols.texStart)
    .hi(rows.texEnd - rows.texStart, cols.texEnd - cols.texStart);

  // Ranges of full rows in a row-major array are contiguous, so no need to copy
  const [, totalCols] = values.shape;
  const [rowStride, colStride] = values.stride;
  if (
    colStride === 1 &&
    rowStride === totalCols &&
    cols.texStart === 0 &&
    cols.texEnd === totalCols
  ) {
    const data = values.data.subarray(view.offset, view.offset + view.size);
    return ndarray(data as T, view.shape);
  }

  return createArrayFromView(view);
}

/*
 * Compute the corners of a chunk's quad within a mesh of the given size, and the
 * texture coordinates of its visible area (i.e. excluding overlapping texels).
 * Edges are computed from the same expression for adjacent chunks, so they match exactly.
 */
export function getChunkBounds(
  chunk: TextureChunk,
  shape: number[],
  size: Size,
): ChunkBounds {
  const [rows, cols] = shape;
  const { width, height } = size;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const { rows: r, cols: c } = chunk;
  const texRows = r.texEnd - r.texStart;
  const texCols = c.texEnd - c.texStart;

  return {
    x: [c.start * cellWidth - width / 2, c.end * cellWidth - width / 2],
    y: [r.start * cellHeight - height / 2, r.end * cellHeight - height / 2],
    u: [(c.start - c.texStart) / texCols, (c.end - c.texStart) / texCols],
    v: [(r.start - r.texStart) / texRows, (r.end - r.texStart) / texRows],
  };
}

export function getChunkGeometry(bounds: ChunkBounds): BufferGeometry {
  const { x, y, u, v } = bounds;

  // Same vertex order as `PlaneGeometry`: top-left, top-right, bottom-left, bottom-right
  const geometry = new BufferGeometry();
  geometry.setIndex([0, 2, 1, 2, 3, 1]);
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      [x[0], y[1], 0, x[1], y[1], 0, x[0], y[0], 0, x[1], y[0], 0],
      3,
    ),
  );
  geometry.setAttribute(
    'uv',
    new Float32BufferAttribute(
      [u[0], v[1], u[1], v[1], u[0], v[0], u[1], v[0]],
      2,
    ),
  );

  return geometry;
}

export function getMask(
  dataArray: NdArray<NumArray>,
  ignoreValue?: IgnoreValue,
): NdArray<Uint8Array> | undefined {
  if (!ignoreValue) {
    return undefined;
  }

  return ndarray(
    Uint8Array.from(dataArray.data.map((v) => (ignoreValue(v) ? 255 : 0))),
    dataArray.shape,
  );
}
