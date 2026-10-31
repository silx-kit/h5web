import {
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';

import { createScale, getAxisDomain, getIntegerTicks } from '../utils';

/**
 * Coordinates of the centers of the data cells along a dimension of size `count`:
 * - indices if no axis values are provided;
 * - mid-points if axis values are pixel edges (i.e. `count + 1` values);
 * - axis values as is otherwise.
 */
export function getCellCenters(
  axisValues: NumArray | undefined,
  count: number,
): number[] {
  if (!axisValues || axisValues.length < count) {
    return Array.from({ length: count }, (_, i) => i);
  }

  if (axisValues.length > count) {
    return Array.from(
      { length: count },
      (_, i) => (axisValues[i] + axisValues[i + 1]) / 2,
    );
  }

  return [...axisValues];
}

/**
 * Domain of an axis, kept descending if the axis values are descending (like in `HeatmapVis`),
 * so that the surface is not mirrored compared to the heatmap.
 */
export function getCoordsDomain(coords: number[]): Domain {
  const domain = getAxisDomain(coords) ?? [-0.5, 0.5];
  const [first, last] = domain;
  if (first !== last) {
    return domain;
  }

  return [first - 0.5, last + 0.5];
}

/**
 * Size of the surface's footprint in world units - the longest side always measures 1.
 * When `keepRatio` is true, the ratio between the axis extents is respected.
 */
export function getFootprint(
  xDomain: Domain,
  yDomain: Domain,
  keepRatio: boolean,
): [number, number] {
  if (!keepRatio) {
    return [1, 1];
  }

  const ratio = Math.abs((xDomain[1] - xDomain[0]) / (yDomain[1] - yDomain[0]));
  return ratio >= 1 ? [1, 1 / ratio] : [ratio, 1];
}

/** Nice ticks within domain (ascending or descending); integer ticks only for axes of indices. */
export function getAxisTicks(
  domain: Domain,
  count: number,
  isIndexAxis: boolean,
): number[] {
  if (isIndexAxis) {
    return getIntegerTicks(domain, count);
  }

  return createScale(ScaleType.Linear, { domain }).ticks(count);
}
