import { scaleLinear } from 'd3-scale';
import { extent, tickStep } from 'd3-array';
import type {
  Size,
  Domain,
  AxisConfig,
  IndexAxisConfig,
  AxisScale,
  AxisInfo,
} from './models';

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

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

export function findDomain(data: number[]): Domain | undefined {
  const domain = extent(data);
  return domain[0] !== undefined && domain[1] !== undefined
    ? domain
    : undefined;
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
  info: AxisInfo,
  visibleDomain: Domain,
  availableSize: number
): { tickValues: number[] } | { numTicks: number } {
  const numTicks = adaptedNumTicks(availableSize);

  return info.isIndexAxis
    ? { tickValues: getIntegerTicks(visibleDomain, numTicks) }
    : { numTicks };
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
