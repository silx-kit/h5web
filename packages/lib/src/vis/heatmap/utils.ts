import type { Domain, NumArray } from '@h5web/shared';
import { ScaleType, isTypedArray } from '@h5web/shared';
import { range } from 'lodash';
import type { NdArray } from 'ndarray';
import {
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  RedFormat,
  UVMapping,
  NearestFilter,
  HalfFloatType,
} from 'three';

import type { CustomDomain, DomainErrors } from '../models';
import { DomainError } from '../models';
import { H5WEB_SCALES } from '../scales';
import { INTERPOLATORS } from './interpolators';
import type { ColorMap, D3Interpolator, Dims } from './models';

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
  const h5webScale = H5WEB_SCALES[scaleType];

  const [min, max] = domain;
  const { validMin } = h5webScale;

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

export function getDims(dataArray: NdArray): Dims {
  const [rows, cols] = dataArray.shape;
  return { rows, cols };
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

export function getAxisValues(
  rawValues: NumArray | undefined,
  pixelCount: number
): number[] {
  if (!rawValues) {
    return range(pixelCount + 1);
  }

  if (rawValues.length === pixelCount + 1) {
    return isTypedArray(rawValues) ? [...rawValues] : rawValues;
  }

  if (rawValues.length === pixelCount) {
    // Add value at right-hand side of last pixel, assuming raw values are regularly spaced
    const deltaCoord = rawValues[1] - rawValues[0];
    return [...rawValues, rawValues[rawValues.length - 1] + deltaCoord];
  }

  throw new Error(
    `Expected array to have length ${pixelCount} or ${pixelCount + 1}, not ${
      rawValues.length
    }`
  );
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

/*
 * Since the shader of `HeatmapMesh` works with floats and expects a texture with a
 * single colour channel (red), we are first limited to using the RED texture format.
 *
 * In WebGL 2.0 (https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.6),
 * this format is compatible only with texture types UNSIGNED_BYTE, HALF_FLOAT and FLOAT.
 *
 * Moreover, the shader uses a `sampler2D` uniform for the texture, which leads to
 * integer values (in the case of UNSIGNED_BYTE) being normalized to [0, 1].
 * This requires the color map domain to be normalized as well, which is challenging
 * in the case of symlog.
 *
 * This is why we support only Float32Array (FLOAT) and Uint16Array (HALF_FLOAT).
 */
export function getDataTexture(
  values: NdArray<Float32Array | Uint16Array>,
  magFilter = NearestFilter
): DataTexture {
  const { data, shape } = values;
  const [rows, cols] = shape;

  return new DataTexture(
    data,
    cols,
    rows,
    RedFormat,
    values.dtype === 'uint16' ? HalfFloatType : FloatType,
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    magFilter
  );
}
