import { range } from 'lodash-es';
import type ndarray from 'ndarray';
import {
  BoundError,
  CustomDomain,
  Domain,
  DomainErrors,
  ScaleType,
} from '../models';
import { INTERPOLATORS } from './interpolators';
import type { ColorMap, D3Interpolator, Dims } from './models';

const GRADIENT_PRECISION = 1 / 20;
const GRADIENT_RANGE = range(0, 1 + GRADIENT_PRECISION, GRADIENT_PRECISION);

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

  if (scaleType !== ScaleType.Log) {
    return [domain, {}];
  }

  const [min, max] = domain;
  const logSafeMin = min <= 0 ? fallbackDomain[0] : min;
  const logSafeMax = max <= 0 ? fallbackDomain[1] : max;
  const logSafeMinGreater = logSafeMin > logSafeMax;

  return [
    [logSafeMinGreater ? logSafeMax : logSafeMin, logSafeMax],
    {
      minError: logSafeMinGreater
        ? BoundError.CustomMaxFallback
        : min <= 0
        ? BoundError.InvalidWithLog
        : undefined,
      maxError: max <= 0 ? BoundError.InvalidWithLog : undefined,
    },
  ];
}

export function getDims(dataArray: ndarray): Dims {
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

export function getPixelEdges(
  pixelCoordinates: number[] | undefined,
  nPixels: number
): number[] {
  if (!pixelCoordinates) {
    return range(nPixels + 1);
  }

  if (pixelCoordinates.length === nPixels + 1) {
    return pixelCoordinates;
  }

  if (pixelCoordinates.length === nPixels) {
    // Add the last edge assuming the pixelCoordinates are regularly spaced
    const deltaCoord = pixelCoordinates[1] - pixelCoordinates[0];
    return [
      ...pixelCoordinates,
      pixelCoordinates[pixelCoordinates.length - 1] + deltaCoord,
    ];
  }

  throw new Error(
    `Supplied pixel coordinate array (${
      pixelCoordinates.length
    }) has not the expected length (${nPixels} or ${nPixels + 1})`
  );
}

export function getInterpolator(colorMap: ColorMap, reverse: boolean) {
  const interpolator = INTERPOLATORS[colorMap];
  return reverse ? (t: number) => interpolator(1 - t) : interpolator;
}
