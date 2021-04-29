import { range } from 'lodash-es';
import type ndarray from 'ndarray';
import { assertNumericArray } from '../../../guards';
import type { NumberOrNaN } from '../../../providers/models';
import {
  DomainError,
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
        ? DomainError.CustomMaxFallback
        : min <= 0
        ? DomainError.InvalidMinWithLog
        : undefined,
      maxError: max <= 0 ? DomainError.InvalidMaxWithLog : undefined,
    },
  ];
}

export function getDims(dataArray: ndarray<NumberOrNaN>): Dims {
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
  rawValues: NumberOrNaN[] | undefined,
  pixelCount: number
): NumberOrNaN[] {
  if (!rawValues) {
    return range(pixelCount + 1);
  }
  assertNumericArray(rawValues);

  if (rawValues.length === pixelCount + 1) {
    return rawValues;
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
