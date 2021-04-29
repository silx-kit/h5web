import {
  scaleLinear,
  scaleLog,
  scaleSymlog,
  scaleThreshold,
  PickScaleConfig,
  PickD3Scale,
} from '@visx/scale';
import { tickStep, range } from 'd3-array';
import { format } from 'd3-format';
import ndarray from 'ndarray';
import { assign } from 'ndarray-ops';
import { isNumber } from 'lodash-es';
import type { DimensionMapping } from '../../dimension-mapper/models';
import {
  Size,
  Domain,
  AxisScale,
  ScaleType,
  AxisConfig,
  Bounds,
} from './models';
import { assertDataLength, isDefined } from '../../guards';
import { isAxis } from '../../dimension-mapper/utils';
import type { NumberOrNaN } from '../../providers/models';

const TICK_FORMAT = format('0');

export const DEFAULT_DOMAIN: Domain = [0.1, 1];

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
  config: PickScaleConfig<ScaleType, number>
): AxisScale {
  const { type } = config;

  switch (type) {
    case ScaleType.Linear:
      return scaleLinear<number>(config);
    case ScaleType.Log:
      return scaleLog<number>(config);
    case ScaleType.SymLog:
      return scaleSymlog<number>(config);
    default:
      throw new Error('Unknown type');
  }
}

export function computeVisSize(
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

export function toArray(
  arr: ndarray<NumberOrNaN> | NumberOrNaN[]
): NumberOrNaN[] {
  return 'data' in arr ? (arr.data as NumberOrNaN[]) : arr;
}

export function getBounds(
  valuesArray: ndarray<NumberOrNaN> | NumberOrNaN[],
  errorArray?: ndarray<NumberOrNaN> | NumberOrNaN[]
): Bounds | undefined {
  assertDataLength(errorArray, valuesArray, 'error');

  const values = toArray(valuesArray);
  const errors = errorArray && toArray(errorArray);

  if (values.length === 0) {
    return undefined;
  }

  return values.reduce<Bounds>(
    (acc, val, i) => {
      if (val === null) {
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
}

export function getDomain(
  valuesArray: ndarray<NumberOrNaN> | NumberOrNaN[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: ndarray<NumberOrNaN> | NumberOrNaN[]
): Domain | undefined {
  const bounds = getBounds(valuesArray, errorArray);

  return getValidDomainForScale(bounds, scaleType);
}

export function getDomains(
  arrays: (ndarray<NumberOrNaN> | NumberOrNaN[])[],
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

export function clampBound(val: number, withPositiveMin = false): number {
  const absVal = Math.abs(val);

  if (withPositiveMin && absVal <= 0) {
    return Number.MIN_VALUE;
  }

  if (absVal > Number.MAX_VALUE / 2) {
    return (Math.sign(val) * Number.MAX_VALUE) / 2; // max domain length is `Number.MAX_VALUE`
  }

  return val;
}

export function extendDomain(
  domain: Domain,
  extendFactor: number,
  scaleType = ScaleType.Linear
): Domain {
  if (extendFactor <= 0) {
    return domain;
  }

  const [min, max] = domain;
  const isLog = scaleType === ScaleType.Log;

  if (min <= 0 && isLog) {
    throw new Error('Expected domain compatible with log scale');
  }

  if (min === max) {
    return extendEmptyDomain(min, extendFactor, scaleType);
  }

  const scale = createAxisScale({ type: scaleType, domain, range: [0, 1] });

  return [
    clampBound(scale.invert(-extendFactor), isLog),
    clampBound(scale.invert(1 + extendFactor), isLog),
  ];
}

export function getValueToIndexScale(
  values: number[],
  switchAtMidpoints?: boolean
): PickD3Scale<'threshold', number, number, number> {
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
  const { scaleType, domain } = config;

  return createAxisScale({
    domain,
    range: [-canvasSize / 2, canvasSize / 2],
    type: scaleType || ScaleType.Linear,
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
  const [min, max] = domain;
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
    return TICK_FORMAT;
  }

  // If available size allows for all log ticks to be rendered without overlap, use default formatter
  const [min, max] = domain[0] > 0 ? domain : [-domain[1], -[domain[0]]];
  const threshold = adaptedLogTicksThreshold(availableSize);
  if (max / min < 10 ** threshold) {
    return TICK_FORMAT;
  }

  // Otherwise, use formatter that hides non-exact powers of 10
  return (val) => {
    const loggedVal = Math.log10(Math.abs(val.valueOf()));
    return loggedVal === Math.floor(loggedVal) ? TICK_FORMAT(val) : ''; // eslint-disable-line new-cap
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
): T extends (infer U)[] ? ndarray<U> : undefined;

export function getBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): ndarray<T> | undefined {
  return value && ndarray<T>(value.flat(rawDims.length - 1) as T[], rawDims);
}

export function applyMapping<T extends ndarray<unknown> | undefined>(
  baseArray: T,
  mapping: DimensionMapping
): T extends ndarray<infer U> ? ndarray<U> : undefined;

export function applyMapping<T>(
  baseArray: ndarray<T> | undefined,
  mapping: DimensionMapping
): ndarray<T> | undefined {
  if (!baseArray) {
    return undefined;
  }

  const isXBeforeY =
    mapping.includes('y') && mapping.indexOf('x') < mapping.indexOf('y');

  const slicingState = mapping.map((val) => (isNumber(val) ? val : null));
  const slicedView = baseArray.pick(...slicingState);
  const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

  // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
  const mappedArray = ndarray<T>([], mappedView.shape);
  assign(mappedArray, mappedView);

  return mappedArray;
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType
): Domain | undefined {
  if (bounds === undefined) {
    return undefined;
  }

  const { min, max, positiveMin } = bounds;
  if (scaleType !== ScaleType.Log || min * max > 0) {
    return [min, max];
  }

  // Clamp domain minimum to first positive value,
  // or return `undefined` if domain is not unsupported: `[-x, 0]`
  return positiveMin !== Infinity ? [positiveMin, max] : undefined;
}

export function getSliceSelection(dimMapping: DimensionMapping): string {
  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  return dimMapping.map((dim) => (isAxis(dim) ? ':' : dim)).join(',');
}
