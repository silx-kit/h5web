import ndarray from 'ndarray';
import { describe, expect, it } from 'vitest';

import { type AnyNumArray, type Bounds, type IgnoreValue } from './vis-models';
import { getBounds, getBoundsWithErrors, getValues } from './vis-utils';

/* Straightforward reference implementation of the bounds scan, kept
   deliberately naive. `getBounds` and `getBoundsWithErrors` are optimised for
   large datasets, so they are checked against this instead of against
   hard-coded expectations. */
function referenceBounds(
  valuesArray: AnyNumArray,
  ignoreValue?: IgnoreValue,
): Bounds | undefined {
  const kept = [...getValues(valuesArray)].filter(
    (val) => Number.isFinite(val) && !ignoreValue?.(val),
  );

  if (kept.length === 0) {
    return undefined;
  }

  return {
    min: Math.min(...kept),
    max: Math.max(...kept),
    positiveMin: Math.min(...kept.filter((val) => val >= 0)),
    strictPositiveMin: Math.min(...kept.filter((val) => val > 0)),
  };
}

/* Deterministic generator (MINSTD): a seed keeps failures reproducible, and
   each case mixes in the values that typically break hand-rolled scans — NaN,
   both infinities, and zero. */
function makeValues(seed: number, length: number): number[] {
  const SPECIAL = [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    0,
  ];

  let state = seed;

  return Array.from({ length }, (_, i) => {
    state = (state * 48_271) % 2_147_483_647;
    const draw = state / 2_147_483_647;

    return draw < 0.15 ? SPECIAL[i % SPECIAL.length] : draw * 2000 - 1000;
  });
}

const GENERATED_CASES = Array.from({ length: 200 }, (_, i) => ({
  seed: i + 1,
  length: 1 + (i % 40),
}));

function ignoreLargeAndZero(value: number): boolean {
  return value > 500 || value === 0;
}

/* The seed travels inside the compared value so that a failure names the case
   that broke, rather than just dumping two sets of bounds. */
describe('getBounds', () => {
  it('should match the reference implementation on generated inputs', () => {
    for (const { seed, length } of GENERATED_CASES) {
      const values = makeValues(seed, length);

      expect({ seed, bounds: getBounds(values) }).toEqual({
        seed,
        bounds: referenceBounds(values),
      });
    }
  });

  it('should match the reference implementation with an `ignoreValue`', () => {
    for (const { seed, length } of GENERATED_CASES) {
      const values = makeValues(seed, length);

      expect({ seed, bounds: getBounds(values, ignoreLargeAndZero) }).toEqual({
        seed,
        bounds: referenceBounds(values, ignoreLargeAndZero),
      });
    }
  });

  it('should handle monotonic inputs', () => {
    /* A decreasing run never updates `max` past the first element if the scan
       short-circuits its comparisons, so both directions are worth checking. */
    const increasing = Array.from({ length: 50 }, (_, i) => i - 25);
    const decreasing = [...increasing].reverse();

    expect(getBounds(increasing)).toEqual(referenceBounds(increasing));
    expect(getBounds(decreasing)).toEqual(referenceBounds(decreasing));
  });

  it('should ignore non-finite values', () => {
    const values = [
      Number.NaN,
      3,
      Number.POSITIVE_INFINITY,
      1,
      Number.NEGATIVE_INFINITY,
    ];

    expect(getBounds(values)).toEqual({
      min: 1,
      max: 3,
      positiveMin: 1,
      strictPositiveMin: 1,
    });
  });

  it('should return `undefined` when no value is usable', () => {
    expect(getBounds([])).toBeUndefined();
    expect(getBounds([Number.NaN, Number.NaN])).toBeUndefined();
    expect(
      getBounds([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]),
    ).toBeUndefined();
    expect(getBounds([1, 2], () => true)).toBeUndefined();
  });

  it('should support typed arrays and ndarrays', () => {
    const values = [4, -2, 7, 0];

    expect(getBounds(Float64Array.from(values))).toEqual(
      referenceBounds(values),
    );
    expect(getBounds(Int32Array.from(values))).toEqual(referenceBounds(values));
    expect(getBounds(ndarray(Float32Array.from(values), [2, 2]))).toEqual(
      referenceBounds(values),
    );
  });
});

describe('getBoundsWithErrors', () => {
  it('should match the reference implementation on generated inputs', () => {
    for (const { seed, length } of GENERATED_CASES) {
      const values = makeValues(seed, length);
      const errors = makeValues(seed + 5000, length).map(Math.abs);

      const [withErrors, withoutErrors] = getBoundsWithErrors(values, errors);

      // Bounds without errors must equal a plain scan of the values
      expect({ seed, bounds: withoutErrors }).toEqual({
        seed,
        bounds: referenceBounds(values),
      });

      // Bounds with errors must equal a scan over every value and value±error
      const extended = values.flatMap((value, i) => {
        const error = errors[i];

        return Number.isFinite(value) && Number.isFinite(error)
          ? [value, value - error, value + error]
          : [value];
      });

      expect({ seed, bounds: withErrors }).toEqual({
        seed,
        bounds: referenceBounds(extended),
      });
    }
  });

  it('should ignore errors that are not finite', () => {
    const [withErrors] = getBoundsWithErrors(
      [10, 20],
      [Number.NaN, Number.POSITIVE_INFINITY],
    );

    expect(withErrors).toEqual(referenceBounds([10, 20]));
  });

  it('should throw when errors and values have different lengths', () => {
    expect(() => getBoundsWithErrors([1, 2, 3], [1, 2])).toThrow(/error/u);
  });
});
