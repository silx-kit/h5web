import { scaleLinear, scaleThreshold } from '@visx/scale';
import type { ScaleLinear, ScaleThreshold } from 'd3-scale';
import { tickStep, range } from 'd3-array';
import type { NdArray } from 'ndarray';
import type {
  Size,
  AxisScale,
  AxisConfig,
  AxisOffsets,
  ScaleGammaConfig,
  VisxScaleConfig,
  VisScaleType,
} from './models';
import { H5WEB_SCALES } from './scales';
import { clamp } from 'three/src/math/MathUtils';
import type { Domain } from '@h5web/shared';
import {
  getValidDomainForScale,
  ScaleType,
  isDefined,
  formatTick,
  isScaleType,
  getBounds,
} from '@h5web/shared';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

const AXIS_OFFSETS = { vertical: 72, horizontal: 40, fallback: 16 };

export const adaptedNumTicks: ScaleLinear<number, number> = scaleLinear({
  domain: [300, 900],
  range: [3, 10],
  clamp: true,
  round: true,
});

const adaptedLogTicksThreshold = scaleLinear({
  domain: [300, 500],
  range: [0.8, 1.4],
});

export function createAxisScale(
  scaleType: VisScaleType,
  config: VisxScaleConfig | ScaleGammaConfig
): AxisScale {
  if (isScaleType(scaleType)) {
    return H5WEB_SCALES[scaleType].createScale(config);
  }

  const [, exponent] = scaleType;
  return H5WEB_SCALES[ScaleType.Gamma].createScale({ ...config, exponent });
}

export function computeCanvasSize(
  availableSize: Size,
  aspectRatio?: number
): Size | undefined {
  const { width, height } = availableSize;

  if (width <= 0 && height <= 0) {
    return undefined;
  }

  if (!aspectRatio) {
    return availableSize;
  }

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const idealHeight = width / aspectRatio;
  const shouldReduceWidth = idealHeight > height;

  return shouldReduceWidth
    ? { width: height * aspectRatio, height }
    : { width, height: width / aspectRatio };
}

export function getDomain(
  valuesArray: NdArray<number[]> | number[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: NdArray<number[]> | number[]
): Domain | undefined {
  const bounds = getBounds(valuesArray, errorArray);

  return getValidDomainForScale(bounds, scaleType);
}

export function getDomains(
  arrays: (NdArray<number[]> | number[])[],
  scaleType: ScaleType = ScaleType.Linear
): (Domain | undefined)[] {
  return arrays.map((arr) => getDomain(arr, scaleType));
}

function extendEmptyDomain(
  value: number,
  extendFactor: number,
  scaleType: ScaleType
): Domain {
  if (scaleType === ScaleType.Log) {
    return [value * 10 ** -extendFactor, value * 10 ** extendFactor];
  }

  if (value === 0) {
    return [-1, 1];
  }

  const extension = Math.abs(value) * extendFactor;
  return [value - extension, value + extension];
}

export function clampBound(
  val: number,
  supportedDomain: Domain = [-Number.MAX_VALUE / 2, Number.MAX_VALUE / 2]
): number {
  const [supportedMin, supportedMax] = supportedDomain;

  return clamp(val, supportedMin, supportedMax);
}

export function extendDomain(
  domain: Domain,
  extendFactor: number,
  scaleType = ScaleType.Linear
): Domain {
  if (extendFactor <= 0) {
    return domain;
  }

  const { validMin } = H5WEB_SCALES[scaleType];

  const [min] = domain;
  if (min < validMin) {
    throw new Error(`Expected domain compatible with ${scaleType} scale`);
  }

  const extendedDomain = unsafeExtendDomain(domain, extendFactor, scaleType);

  return [Math.max(validMin, extendedDomain[0]), extendedDomain[1]];
}

function unsafeExtendDomain(
  domain: Domain,
  extendFactor: number,
  scaleType: ScaleType
): Domain {
  const [min, max] = domain;
  if (min === max) {
    return extendEmptyDomain(min, extendFactor, scaleType);
  }

  const scale = createAxisScale(scaleType, { domain, range: [0, 1] });
  return [scale.invert(-extendFactor), scale.invert(1 + extendFactor)];
}

export function getValueToIndexScale(
  values: number[],
  switchAtMidpoints?: boolean
): ScaleThreshold<number, number> {
  const indices = range(values.length);

  const thresholds = switchAtMidpoints
    ? values.map((_, i) => values[i - 1] + (values[i] - values[i - 1]) / 2) // Shift the thresholds for the switch from i-1 to i to happen between values[i-1] and values[i]
    : values; // Else, the switch from i-1 to i will happen at values[i]

  // First threshold (going from 0 to 1) should be for the second value. Scaling the first value should return at 0.
  return scaleThreshold<number, number>({
    domain: thresholds.slice(1),
    range: indices,
  });
}

export function getCanvasScale(
  config: AxisConfig,
  canvasSize: number
): AxisScale {
  const { scaleType, visDomain, flip } = config;
  const range = [-canvasSize / 2, canvasSize / 2];

  return createAxisScale(scaleType ?? ScaleType.Linear, {
    domain: visDomain,
    range: flip ? range.reverse() : range,
  });
}

/**
 * We can't rely on the axis scale's `ticks` method to get integer tick values because
 * `d3.tickStep` sometimes returns incoherent step values - e.g. `d3.tickStep(0, 2, 3)`
 * returns 0.5 instead of 1.
 *
 * So we implement our own, simplified version of `d3.ticks` that always outputs integer values.
 */
export function getIntegerTicks(domain: Domain, count: number): number[] {
  const min = Math.min(...domain);
  const max = Math.max(...domain);
  const intMin = Math.ceil(min);
  const intMax = Math.floor(max);

  const domainLength = intMax - intMin + 1;
  const optimalCount = Math.min(domainLength, count);

  if (optimalCount === 0) {
    return [];
  }

  // Make sure we always use a step that is greater than or equal to 1
  const step = Math.max(tickStep(intMin, intMax, optimalCount), 1);

  const start = Math.ceil(min / step);
  const stop = Math.floor(max / step);
  const numTicks = stop - start + 1;

  return Array.from({ length: numTicks }, (_, i) => (start + i) * step);
}

export function getTickFormatter(
  domain: Domain,
  availableSize: number,
  scaleType: ScaleType
): (val: number | { valueOf(): number }) => string {
  if (scaleType !== ScaleType.Log) {
    return formatTick;
  }

  // If available size allows for all log ticks to be rendered without overlap, use default formatter
  const [min, max] = domain[0] > 0 ? domain : [-domain[1], -[domain[0]]];
  const threshold = adaptedLogTicksThreshold(availableSize);
  if (max / min < 10 ** threshold) {
    return formatTick;
  }

  // Otherwise, use formatter that hides non-exact powers of 10
  return (val) => {
    const loggedVal = Math.log10(Math.abs(val.valueOf()));
    return loggedVal === Math.floor(loggedVal) ? formatTick(val) : '';
  };
}

export function getCombinedDomain(
  domains: (Domain | undefined)[]
): Domain | undefined {
  const domainsToCombine = domains.filter(isDefined);
  if (domainsToCombine.length === 0) {
    return undefined;
  }

  return domainsToCombine.reduce((accDomain, nextDomain) => [
    Math.min(accDomain[0], nextDomain[0]),
    Math.max(accDomain[1], nextDomain[1]),
  ]);
}

export function getAxisOffsets(
  hasLabel: Partial<Record<keyof AxisOffsets, boolean>> = {}
) {
  const { horizontal, vertical, fallback } = AXIS_OFFSETS;

  return {
    left: (hasLabel.left ? fallback : 0) + vertical,
    bottom: (hasLabel.bottom ? fallback : 0) + horizontal,
    right: hasLabel.right ? vertical : fallback,
    top: hasLabel.top ? horizontal : fallback,
  };
}
