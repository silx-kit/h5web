import { describe, expect, it } from 'vitest';

import { getBaseArray } from './utils';

describe('getBaseArray', () => {
  it('should create ndarray with given dimensions', () => {
    const baseArray = getBaseArray(
      Float32Array.from([1, 2, 3, 4, 5, 6]),
      [2, 3],
    );

    expect(baseArray.shape).toEqual([2, 3]);
    expect(baseArray.get(1, 2)).toBe(6);
  });

  it('should accept value with more elements than dimensions', () => {
    const baseArray = getBaseArray([1, 2, 3, 4, 5, 6, 7], [2, 3]);
    expect(baseArray.get(1, 2)).toBe(6);
  });

  it('should throw if value has fewer elements than dimensions', () => {
    // e.g. empty buffer received for dataset too large to be loaded (#1650)
    expect(() => getBaseArray(new Float32Array(0), [973_350, 3000])).toThrow(
      'Expected value with at least 2920050000 elements instead of 0',
    );
    expect(() => getBaseArray([1, 2, 3], [2, 3])).toThrow(
      'Expected value with at least 6 elements instead of 3',
    );
  });
});
