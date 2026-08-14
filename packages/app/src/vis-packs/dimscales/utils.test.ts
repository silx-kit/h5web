import { arrayShape, floatType, strType } from '@h5web/shared/hdf5-utils';
import { dataset, group } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import {
  getDimensionLabels,
  getScaleLabel,
  isUsableScale,
  tryFetch,
} from './utils';

function scaleOfShape(dims: number[]) {
  return dataset('scale', arrayShape(dims), floatType());
}

// Declared `number` rather than `never` so `tryFetch`'s result stays a real value
function failing(): number {
  throw new Error('nope');
}

function noop(): undefined {
  return undefined;
}

/* A `FetchStore` reports "still loading" by throwing the pending promise, so
 * these tests have to throw non-errors deliberately. */
/* eslint-disable @typescript-eslint/only-throw-error */
describe('tryFetch', () => {
  it('should return the fetched value', () => {
    expect(tryFetch(() => 42)).toBe(42);
  });

  it('should swallow an error so the caller can fall back', () => {
    expect(tryFetch(failing)).toBeUndefined();
  });

  it('should re-throw the very promise Suspense needs to see', () => {
    const pending = Promise.resolve(); // stands in for a fetch in flight

    function suspending(): never {
      throw pending;
    }

    let caught: unknown;
    try {
      tryFetch(suspending);
    } catch (error) {
      caught = error;
    }

    // Suspense keys off promise identity, so a copy would not do
    expect(caught).toBe(pending);
  });

  /* Property: exactly one kind of thrown value - a promise - propagates, and
   * everything else, however exotic, degrades to `undefined`. A `FetchStore`
   * throws both to signal loading and to signal failure, so conflating the two
   * either breaks Suspense or hides the fallback. */
  it('should propagate promises and only promises', () => {
    // eslint-disable-next-line unicorn/no-thenable -- duck-typed, but not a promise
    const thenable = { then: noop };

    const thrown: unknown[] = [
      Promise.resolve(),
      new Error('error'),
      new TypeError('type error'),
      'string',
      0,
      undefined,
      null,
      thenable,
    ];

    const propagated = thrown.map((value) => {
      try {
        tryFetch(() => {
          throw value;
        });
        return false;
      } catch {
        return true;
      }
    });

    expect(propagated).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });
});
/* eslint-enable @typescript-eslint/only-throw-error */

describe('isUsableScale', () => {
  it('should accept a 1D numeric dataset matching the dimension', () => {
    expect(isUsableScale(scaleOfShape([10]), 10)).toBe(true);
  });

  it('should reject a missing entity', () => {
    // The scale's path failed to resolve, so there is nothing to plot against
    expect(isUsableScale(undefined, 10)).toBe(false);
  });

  it('should reject an entity that is not a dataset', () => {
    expect(isUsableScale(group('scale'), 10)).toBe(false);
  });

  it('should reject a non-numeric scale', () => {
    // A string scale is legal HDF5 but cannot be plotted as an axis
    expect(isUsableScale(dataset('s', arrayShape([10]), strType()), 10)).toBe(
      false,
    );
  });

  it('should reject an incompatible shape', () => {
    expect(isUsableScale(scaleOfShape([9]), 10)).toBe(false);
    expect(isUsableScale(scaleOfShape([11]), 10)).toBe(false);
    expect(isUsableScale(scaleOfShape([10, 2]), 10)).toBe(false);
  });
});

describe('getScaleLabel', () => {
  it('should prefer the dimension label over the scale name', () => {
    expect(getScaleLabel('time', 'times', 'times', undefined)).toBe('time');
  });

  it('should fall back to the scale name, then the dataset name', () => {
    expect(getScaleLabel(undefined, 'times', 'other', undefined)).toBe('times');
    expect(getScaleLabel(undefined, undefined, 'other', undefined)).toBe(
      'other',
    );
  });

  it('should append the units', () => {
    expect(getScaleLabel('time', undefined, undefined, 'seconds')).toBe(
      'time (seconds)',
    );
  });

  it('should return the units alone when there is no name', () => {
    expect(getScaleLabel(undefined, undefined, undefined, 'seconds')).toBe(
      '(seconds)',
    );
  });

  /* Property: the first non-empty name slot always wins, and `units` is
   * appended whenever set. Exhaustive over all 16 present/absent combinations,
   * including the all-absent case. */
  it('should apply the same precedence for every combination of inputs', () => {
    const dimLabels = ['dim', undefined];
    const scaleNames = ['scale', undefined];
    const dsetNames = ['dset', undefined];
    const unitList = ['u', undefined];

    const actual: (string | undefined)[] = [];
    const expected: (string | undefined)[] = [];

    dimLabels.forEach((dimLabel) => {
      scaleNames.forEach((scaleName) => {
        dsetNames.forEach((dsetName) => {
          unitList.forEach((units) => {
            actual.push(getScaleLabel(dimLabel, scaleName, dsetName, units));

            const base = dimLabel || scaleName || dsetName;
            const suffix = units ? ' (u)' : '';
            expected.push(base ? `${base}${suffix}` : units && '(u)');
          });
        });
      });
    });

    expect(actual).toHaveLength(16);
    expect(actual).toEqual(expected);
  });
});

describe('getDimensionLabels', () => {
  it('should return one label per dimension', () => {
    expect(getDimensionLabels(['row', 'column'], 2)).toEqual(['row', 'column']);
  });

  it('should treat an empty label as no label', () => {
    // HDF5 writes an empty string for dimensions left unlabelled
    expect(getDimensionLabels(['', 'column'], 2)).toEqual([
      undefined,
      'column',
    ]);
  });

  it('should ignore a missing or non-array attribute value', () => {
    expect(getDimensionLabels(undefined, 2)).toEqual([undefined, undefined]);
    expect(getDimensionLabels('row', 2)).toEqual([undefined, undefined]);
  });

  /* Property: the output always has exactly one entry per dimension, however
   * many labels the attribute carries. A file with too few (or too many) labels
   * must not shift or truncate the axis mapping. */
  it('should always return one entry per dimension', () => {
    const labels = ['a', 'b', 'c'];

    for (let ndims = 0; ndims <= 5; ndims += 1) {
      for (let count = 0; count <= labels.length; count += 1) {
        const kept = Math.min(count, ndims);
        const result = getDimensionLabels(labels.slice(0, count), ndims);

        expect(result).toHaveLength(ndims);
        expect(result.slice(0, kept)).toEqual(labels.slice(0, kept));
      }
    }
  });
});
