import ndarray from 'ndarray';
import { describe, expect, it } from 'vitest';

import {
  getAxisTicks,
  getCellCenters,
  getCoordsDomain,
  getDownsamplingStride,
  getFootprint,
  getFramingDistance,
  getSampledIndices,
  isSurfaceSupported,
  sampleArray,
} from './utils';

function getVertexCount(rows: number, cols: number, stride: number): number {
  return (
    getSampledIndices(rows, stride).length *
    getSampledIndices(cols, stride).length
  );
}

describe('getDownsamplingStride', () => {
  it('should not downsample below vertex limit', () => {
    expect(getDownsamplingStride(100, 100, 10_000)).toBe(1);
  });

  it('should return smallest stride that keeps vertex count under limit', () => {
    for (const [rows, cols] of [
      [4000, 4000],
      [2000, 3000],
      [1500, 1100],
    ]) {
      const stride = getDownsamplingStride(rows, cols, 1_000_000);
      expect(getVertexCount(rows, cols, stride)).toBeLessThanOrEqual(1_000_000);
      expect(getVertexCount(rows, cols, stride - 1)).toBeGreaterThan(1_000_000);
    }
  });

  it('should enforce vertex limit for elongated arrays', () => {
    const stride = getDownsamplingStride(2, 8_388_608, 1_048_576);
    expect(getVertexCount(2, 8_388_608, stride)).toBeLessThanOrEqual(1_048_576);
  });

  it('should not loop forever when limit cannot be met', () => {
    expect(getDownsamplingStride(3, 3, 1)).toBe(3);
  });
});

describe('getSampledIndices', () => {
  it('should return every index with stride 1', () => {
    expect(getSampledIndices(4, 1)).toEqual([0, 1, 2, 3]);
  });

  it('should always include last index', () => {
    expect(getSampledIndices(10, 3)).toEqual([0, 3, 6, 9]);
    expect(getSampledIndices(11, 3)).toEqual([0, 3, 6, 9, 10]);
  });
});

describe('sampleArray', () => {
  it('should pick given rows and columns', () => {
    const arr = ndarray(
      Float32Array.from({ length: 12 }, (_, i) => i),
      [3, 4],
    );
    const sampled = sampleArray(arr, [0, 2], [1, 3]);
    expect(sampled.shape).toEqual([2, 2]);
    expect([...sampled.data]).toEqual([1, 3, 9, 11]);
  });

  it('should return same array when picking everything', () => {
    const arr = ndarray([1, 2, 3, 4], [2, 2]);
    expect(sampleArray(arr, [0, 1], [0, 1])).toBe(arr);
  });
});

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

describe('isSurfaceSupported', () => {
  it('should require at least two rows and two columns', () => {
    expect(isSurfaceSupported([1, 3])).toBe(false);
    expect(isSurfaceSupported([3, 1])).toBe(false);
    expect(isSurfaceSupported([2, 2])).toBe(true);
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

describe('getFramingDistance', () => {
  it('should fit sphere vertically in landscape viewport', () => {
    // sin(45 / 2) ~ 0.383
    expect(getFramingDistance(1, 45, 2)).toBeCloseTo(2.613, 3);
  });

  it('should fit sphere horizontally in portrait viewport', () => {
    expect(getFramingDistance(1, 45, 0.5)).toBeGreaterThan(
      getFramingDistance(1, 45, 1) ?? Infinity,
    );
  });

  it('should return undefined for zero-sized viewport', () => {
    expect(getFramingDistance(1, 45, Number.NaN)).toBeUndefined();
    expect(getFramingDistance(1, 45, Infinity)).toBeUndefined();
    expect(getFramingDistance(1, 45, 0)).toBeUndefined();
  });
});
