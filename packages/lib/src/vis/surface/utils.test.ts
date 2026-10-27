import { describe, expect, it } from 'vitest';

import {
  getAxisTicks,
  getCellCenters,
  getCoordsDomain,
  getFootprint,
} from './utils';

describe('getCellCenters', () => {
  it('should return indices when no axis values', () => {
    expect(getCellCenters(undefined, 3)).toEqual([0, 1, 2]);
  });

  it('should return axis values as is when one per cell', () => {
    expect(getCellCenters([10, 20, 40], 3)).toEqual([10, 20, 40]);
  });

  it('should return mid-points when axis values are pixel edges', () => {
    expect(getCellCenters([0, 2, 6, 8], 3)).toEqual([1, 4, 7]);
  });
});

describe('getCoordsDomain', () => {
  it('should return extent of finite coordinates', () => {
    expect(getCoordsDomain([-1, Number.NaN, 3, 2])).toEqual([-1, 3]);
  });

  it('should keep descending axes descending, like HeatmapVis', () => {
    expect(getCoordsDomain([3, 2, 1, 0])).toEqual([3, 0]);
  });

  it('should extend degenerate domains', () => {
    expect(getCoordsDomain([5])).toEqual([4.5, 5.5]);
    expect(getCoordsDomain([])).toEqual([-0.5, 0.5]);
  });
});

describe('getFootprint', () => {
  it('should return square footprint when not keeping ratio', () => {
    expect(getFootprint([0, 100], [0, 10], false)).toEqual([1, 1]);
  });

  it('should respect ratio between axis extents with longest side of 1', () => {
    expect(getFootprint([0, 40], [0, 20], true)).toEqual([1, 0.5]);
    expect(getFootprint([0, 10], [-20, 20], true)).toEqual([0.25, 1]);
  });
});

describe('getAxisTicks', () => {
  it('should return nice ticks within domain', () => {
    expect(getAxisTicks([0, 1], 5, false)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(getAxisTicks([-18, 21], 4, false)).toEqual([-10, 0, 10, 20]);
  });

  it('should support descending domains', () => {
    expect(getAxisTicks([21, -18], 4, false)).toEqual([20, 10, 0, -10]);
  });

  it('should return integer ticks for index axes', () => {
    expect(getAxisTicks([0, 3], 10, true)).toEqual([0, 1, 2, 3]);
  });
});
