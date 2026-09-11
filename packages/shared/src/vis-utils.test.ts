import { describe, expect, it } from 'vitest';

import { getBounds, getBoundsWithErrors } from './vis-utils';

describe('getBounds', () => {
  it('should compute bounds of numeric array', () => {
    expect(getBounds([0, 1, 2])).toEqual({
      min: 0,
      max: 2,
      positiveMin: 0,
      strictPositiveMin: 1,
    });

    expect(getBounds([-1, -2, -3])).toEqual({
      min: -3,
      max: -1,
      positiveMin: Infinity,
      strictPositiveMin: Infinity,
    });
  });

  it('should ignore values', () => {
    expect(getBounds([0, 1, 2], (val) => val < 2)).toEqual({
      min: 2,
      max: 2,
      positiveMin: 2,
      strictPositiveMin: 2,
    });
  });

  it('should return undefined if empty or none of the values are finite', () => {
    expect(getBounds([])).toBeUndefined();
    expect(getBounds([Number.NaN, Infinity, -Infinity])).toBeUndefined();
  });
});

describe('getBoundsWithErrors', () => {
  const bounds = { min: 0, max: 2, positiveMin: 0, strictPositiveMin: 1 };

  it('should compute bounds with and without errors', () => {
    expect(getBoundsWithErrors([0, 1, 2], [1, 0.5, 2])).toEqual([
      { min: -1, max: 4, positiveMin: 0, strictPositiveMin: 0.5 },
      bounds,
    ]);
  });

  it('should ignore non-finite errors', () => {
    expect(
      getBoundsWithErrors([0, 1, 2], [Number.NaN, Infinity, -Infinity]),
    ).toEqual([bounds, bounds]);
  });

  it('should return same bounds when errors array is undefined', () => {
    expect(getBoundsWithErrors([0, 1, 2], undefined)).toEqual([bounds, bounds]);
  });

  it('should return undefined bounds if none of the values are finite', () => {
    expect(
      getBoundsWithErrors([Number.NaN, Infinity, -Infinity], [1, 0.5, 2]),
    ).toEqual([undefined, undefined]);
  });
});
