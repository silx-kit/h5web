import { scaleLinear, scaleThreshold } from '@visx/scale';
import type { ScaleThreshold } from 'd3-scale';
import { tickStep, range } from 'd3-array';
import ndarray, { NdArray } from 'ndarray';
import { assign } from 'ndarray-ops';
import { isNumber } from 'lodash';
import type { Axis, DimensionMapping } from '../../dimension-mapper/models';
import {
  Size,
  Domain,
  AxisScale,
  ScaleType,
  AxisConfig,
  Bounds,
  AxisOffsets,
  ScaleGammaConfig,
  VisxScaleConfig,
} from './models';
import { assertDataLength, isDefined } from '../../guards';
import { isAxis } from '../../dimension-mapper/utils';
import { formatTick, getAttributeValue } from '../../utils';
import type { Dataset } from '../../providers/models';
import { H5WEB_SCALES } from './scales';
import { clamp } from 'three/src/math/MathUtils';
import type { VisScaleType } from './heatmap/models';

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

const AXIS_OFFSETS = { vertical: 72, horizontal: 40, fallback: 16 };

export const adaptedNumTicks = scaleLinear({
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

export function getNewBounds(oldBounds: Bounds, value: number): Bounds {
  const { min: oldMin, max: oldMax, positiveMin: oldPositiveMin } = oldBounds;
  return {
    min: Math.min(value, oldMin),
    max: Math.max(value, oldMax),
    positiveMin: value > 0 ? Math.min(value, oldPositiveMin) : oldPositiveMin,
  };
}

export function toArray(arr: NdArray<number[]> | number[]): number[] {
  return 'data' in arr ? arr.data : arr;
}

export function getBounds(
  valuesArray: NdArray<number[]> | number[],
  errorArray?: NdArray<number[]> | number[]
): Bounds | undefined {
  assertDataLength(errorArray, valuesArray, 'error');

  const values = toArray(valuesArray);
  const errors = errorArray && toArray(errorArray);

  const bounds = values.reduce<Bounds>(
    (acc, val, i) => {
      // Ignore NaN and Infinity from the bounds computation
      if (!Number.isFinite(val)) {
        return acc;
      }
      const newBounds = getNewBounds(acc, val);
      const err = errors && errors[i];
      return err
        ? getNewBounds(getNewBounds(newBounds, val - err), val + err)
        : newBounds;
    },
    { min: Infinity, max: -Infinity, positiveMin: Infinity }
  );

  // Return undefined if min is Infinity (values is empty or contains only NaN/Infinity)
  return Number.isFinite(bounds.min) ? bounds : undefined;
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

  return createAxisScale(scaleType || ScaleType.Linear, {
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

export function isScaleType(val: unknown): val is ScaleType {
  return (
    typeof val === 'string' && Object.values<string>(ScaleType).includes(val)
  );
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

export function getBaseArray<T extends unknown[] | undefined>(
  value: T,
  rawDims: number[]
): T extends (infer U)[] ? NdArray<U[]> : undefined;

export function getBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): NdArray<T[]> | undefined {
  return value && ndarray(value, rawDims);
}

export function applyMapping<T extends NdArray<unknown[]> | undefined>(
  baseArray: T,
  mapping: (number | Axis | ':')[]
): T extends NdArray<infer U> ? NdArray<U> : undefined;

export function applyMapping<T>(
  baseArray: NdArray<T[]> | undefined,
  mapping: (number | Axis | ':')[]
): NdArray<T[]> | undefined {
  if (!baseArray) {
    return undefined;
  }

  const isXBeforeY =
    mapping.includes('y') &&
    mapping.includes('x') &&
    mapping.indexOf('x') < mapping.indexOf('y');

  const slicingState = mapping.map((val) => (isNumber(val) ? val : null));
  const slicedView = baseArray.pick(...slicingState);
  const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

  // Create ndarray from mapped view so `mappedArray.data` only contains values relevant to vis
  return createArrayFromView(mappedView);
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType
): Domain | undefined {
  if (bounds === undefined) {
    return undefined;
  }

  const { min, max, positiveMin } = bounds;
  if (scaleType === ScaleType.Log && min * max <= 0) {
    // Clamp domain minimum to first positive value,
    // or return `undefined` if domain is not unsupported: `[-x, 0]`
    return Number.isFinite(positiveMin) ? [positiveMin, max] : undefined;
  }

  if (scaleType === ScaleType.Sqrt && min * max < 0) {
    return [0, max];
  }

  return [min, max];
}

export function getSliceSelection(
  dimMapping?: DimensionMapping
): string | undefined {
  if (!dimMapping || !dimMapping.some(isNumber)) {
    return undefined;
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  return dimMapping.map((dim) => (isAxis(dim) ? ':' : dim)).join(',');
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

export function createArrayFromView<T>(view: NdArray<T[]>): NdArray<T[]> {
  const array = ndarray<T[]>([], view.shape);
  assign(array, view);

  return array;
}

export function hasImageAttribute(dataset: Dataset): boolean {
  const classAttr = getAttributeValue(dataset, 'CLASS');

  return typeof classAttr === 'string' && classAttr === 'IMAGE';
}
