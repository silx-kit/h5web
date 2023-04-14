import {
  type Domain,
  getDims,
  type NumArray,
  ScaleType,
  toTypedNdArray,
} from '@h5web/shared';
import { range } from 'lodash';
import ndarray, { type NdArray } from 'ndarray';
import {
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  HalfFloatType,
  NearestFilter,
  RedFormat,
  type TextureFilter,
  UnsignedByteType,
  UVMapping,
} from 'three';

import { type CustomDomain, DomainError, type DomainErrors } from '../models';
import { H5WEB_SCALES } from '../scales';
import { getAxisValues } from '../utils';
import { INTERPOLATORS } from './interpolators';
import {
  type ColorMap,
  type D3Interpolator,
  type TextureSafeTypedArray,
} from './models';

const GRADIENT_PRECISION = 1 / 20;
export const GRADIENT_RANGE = range(
  0,
  1 + GRADIENT_PRECISION,
  GRADIENT_PRECISION
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
  dataDomain: Domain
): Domain {
  return [customDomain[0] ?? dataDomain[0], customDomain[1] ?? dataDomain[1]];
}

export function getSafeDomain(
  domain: Domain,
  fallbackDomain: Domain,
  scaleType: ScaleType
): [Domain, DomainErrors] {
  if (domain[0] > domain[1]) {
    return [fallbackDomain, { minGreater: true }];
  }

  const [min, max] = domain;
  const { validMin } = H5WEB_SCALES[scaleType];

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
  minMaxOnly: boolean
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
  minMaxOnly = false
): string {
  const colorStops = getColorStops(interpolator, minMaxOnly);
  return `linear-gradient(to ${direction}, ${colorStops})`;
}

export function getPixelEdgeValues(
  rawValues: NumArray | undefined,
  pixelCount: number
): NumArray {
  if (rawValues && rawValues.length === pixelCount) {
    // Add value at right-hand side of last pixel, assuming raw values are regularly spaced
    const deltaCoord = rawValues[1] - rawValues[0];
    return [...rawValues, rawValues[rawValues.length - 1] + deltaCoord];
  }

  // nEdges = nPixels + 1
  return getAxisValues(rawValues, pixelCount + 1);
}

export function getInterpolator(colorMap: ColorMap, reverse: boolean) {
  const interpolator = INTERPOLATORS[colorMap];
  return reverse ? (t: number) => interpolator(1 - t) : interpolator;
}

export function scaleDomain(
  domain: Domain,
  scaleType = ScaleType.Linear
): Domain {
  const scaleFn = SCALE_FNS[scaleType];
  return [scaleFn(domain[0]), scaleFn(domain[1])];
}

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray>
): NdArray<TextureSafeTypedArray>;

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined
): NdArray<TextureSafeTypedArray> | undefined;

export function toTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined
): NdArray<TextureSafeTypedArray> | undefined {
  if (!ndArr) {
    return undefined;
  }

  if (ndArr.dtype === 'float32' || ndArr.dtype.startsWith('uint8')) {
    return ndArr as NdArray<TextureSafeTypedArray>;
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
  values: NdArray<TextureSafeTypedArray | Uint16Array>,
  magFilter?: TextureFilter
): DataTexture;
export function getDataTexture(
  values: undefined,
  magFilter?: TextureFilter
): undefined;
export function getDataTexture(
  values: NdArray<TextureSafeTypedArray | Uint16Array> | undefined,
  magFilter?: TextureFilter
): DataTexture | undefined;
export function getDataTexture(
  values: NdArray<TextureSafeTypedArray | Uint16Array> | undefined,
  magFilter: TextureFilter = NearestFilter
): DataTexture | undefined {
  if (!values) {
    return undefined;
  }
  const { rows, cols } = getDims(values);

  const texture = new DataTexture(
    values.data,
    cols,
    rows,
    RedFormat,
    TEXTURE_TYPES[values.dtype],
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    magFilter
  );
  texture.needsUpdate = true;

  return texture;
}

export function getMask(
  dataArray: NdArray<NumArray>,
  ignoreValue: ((v: number) => boolean) | undefined
): NdArray<Uint8Array> | undefined {
  if (!ignoreValue) {
    return undefined;
  }

  return ndarray(
    Uint8Array.from(dataArray.data.map((v) => (ignoreValue(v) ? 255 : 0))),
    dataArray.shape
  );
}
