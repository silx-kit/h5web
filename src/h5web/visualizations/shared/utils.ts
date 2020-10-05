import { scaleLinear } from 'd3-scale';
import { extent, tickStep } from 'd3-array';
import { format } from 'd3-format';
import {
  Size,
  Domain,
  AxisScale,
  AxisConfig,
  AxisInfo,
  IndexAxisConfig,
  ScaleType,
} from './models';

const TICK_FORMAT = format('0');

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

const adaptedLogTicksThreshold = scaleLinear()
  .domain([300, 500])
  .range([0.8, 1.4]);

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

export function findDomain(data: number[]): Domain | undefined {
  const domain = extent(data);
  return domain[0] !== undefined && domain[1] !== undefined
    ? domain
    : undefined;
}

export function getSupportedDomain(
  domain: Domain | undefined,
  scaleType: ScaleType,
  values: number[]
): Domain | undefined {
  if (!domain) {
    return undefined;
  }

  // If scale is not log or domain does not cross zero, domain is supported
  if (scaleType !== ScaleType.Log || domain[0] * domain[1] > 0) {
    return domain;
  }

  // Find domain again but only amongst positive values
  // Note that [-X, 0] is not supported at all and will return `undefined`
  const supportedDomain = findDomain(values.filter((x) => x > 0));

  // Clamp domain minimum to the first positive value
  return supportedDomain && [supportedDomain[0], domain[1]];
}

export function extendDomain(
  bareDomain: Domain,
  extendFactor: number,
  isLog?: boolean
): Domain {
  const [min, max] = bareDomain;

  if (isLog) {
    return [min / (1 + extendFactor), max * (1 + extendFactor)];
  }

  const extension = (max - min) * extendFactor;
  return [min - extension, max + extension];
}

export function isIndexAxisConfig(
  config: AxisConfig
): config is IndexAxisConfig {
  return 'indexDomain' in config;
}

export function getAxisScale(info: AxisInfo, rangeSize: number): AxisScale {
  const { scaleFn, domain } = info;

  const scale = scaleFn();
  scale.domain(domain);
  scale.range([-rangeSize / 2, rangeSize / 2]);

  return scale;
}

/**
 * We can't rely on the axis scale's `ticks` method to get integer tick values because
 * `d3.tickStep` sometimes returns incoherent step values - e.g. `d3.tickStep(0, 2, 3)`
 * returns 0.5 instead of 1.
 *
 * So we implement our own, simplified version of `d3.ticks` that always outputs integer values.
 */
function getIntegerTicks(domain: Domain, count: number): number[] {
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

  const ticks = new Array(numTicks);
  for (let i = 0; i < numTicks; i++) {
    ticks[i] = (start + i) * step;
  }

  return ticks;
}

export function getTicksProp(
  visibleDomain: Domain,
  availableSize: number,
  onlyIntegers?: boolean
): { tickValues: number[] } | { numTicks: number } {
  const numTicks = adaptedNumTicks(availableSize);

  return onlyIntegers
    ? { tickValues: getIntegerTicks(visibleDomain, numTicks) }
    : { numTicks };
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
    if (loggedVal !== Math.floor(loggedVal)) return '';
    return TICK_FORMAT(val);
  };
}

export function assertNumOrStr(val: unknown): asserts val is number | string {
  if (typeof val !== 'number' && typeof val !== 'string') {
    throw new Error('Expected number or string');
  }
}

export function assertArray<T>(val: unknown): asserts val is T[] {
  if (!Array.isArray(val)) {
    throw new Error('Expected array');
  }
}
