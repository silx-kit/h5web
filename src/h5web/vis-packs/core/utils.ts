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
import {
  Size,
  Domain,
  AxisScale,
  ScaleType,
  AxisConfig,
  Bounds,
} from './models';

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

function getNewBounds(oldBounds: Bounds, value: number): Bounds {
  const [minBound, maxBound, minPositiveBound] = oldBounds;
  return [
    Math.min(value, minBound),
    Math.max(value, maxBound),
    value > 0 ? Math.min(value, minPositiveBound) : minPositiveBound,
  ];
}

export function getDomain(
  values: number[],
  scaleType: ScaleType = ScaleType.Linear,
  errors?: number[]
): Domain | undefined {
  if (values.length === 0) {
    return undefined;
  }

  if (errors && errors.length !== values.length) {
    throw new Error(
      `Errors length (${errors.length}) does not match data length (${values.length})`
    );
  }

  const [min, max, positiveMin] = values.reduce<Bounds>(
    (acc, val, i) => {
      const newBounds = getNewBounds(acc, val);
      const err = errors && errors[i];
      return err
        ? getNewBounds(getNewBounds(newBounds, val - err), val + err)
        : newBounds;
    },
    [values[0], values[0], Infinity]
  );

  if (scaleType !== ScaleType.Log || min * max > 0) {
    return [min, max];
  }

  // Clamp domain minimum to first positive value,
  // or return `undefined` if domain is not unsupported: `[-x, 0]`
  return positiveMin !== Infinity ? [positiveMin, max] : undefined;
}

export function extendDomain(
  bareDomain: Domain,
  extendFactor: number,
  scaleType: ScaleType = ScaleType.Linear
): Domain {
  if (extendFactor <= 0) {
    return bareDomain;
  }

  const [min, max] = bareDomain;
  const domain =
    min === max
      ? [min * (1 - extendFactor), min * (1 + extendFactor)]
      : bareDomain;

  const scale = createAxisScale({
    type: scaleType,
    domain,
    range: [0, 1],
  });

  return [scale.invert(-extendFactor), scale.invert(1 + extendFactor)];
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
