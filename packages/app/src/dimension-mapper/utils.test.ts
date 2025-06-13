import { describe, expect, it } from 'vitest';

import { initDimMapping } from './utils';

describe('initDimMapping', () => {
  it('should map axes to dimensions', () => {
    expect(initDimMapping([], 0)).toStrictEqual([]);
    expect(initDimMapping([1], 1)).toStrictEqual(['x']);
    expect(initDimMapping([1, 1], 2)).toStrictEqual(['y', 'x']);
  });

  it('should slice extra dimensions', () => {
    expect(initDimMapping([1], 0)).toStrictEqual([0]);
    expect(initDimMapping([1, 1], 1)).toStrictEqual([0, 'x']);
    expect(initDimMapping([1, 1, 1], 1)).toStrictEqual([0, 0, 'x']);
    expect(initDimMapping([1, 1, 1], 2)).toStrictEqual([0, 'y', 'x']);
    expect(initDimMapping([1, 1, 1, 1], 2)).toStrictEqual([0, 0, 'y', 'x']);
  });

  it('should cap number of axes to number of dimensions', () => {
    expect(initDimMapping([], 1)).toStrictEqual([]);
    expect(initDimMapping([], 2)).toStrictEqual([]);
    expect(initDimMapping([1], 2)).toStrictEqual(['x']);
  });

  it('should throw when number of axes not supported', () => {
    expect(() => initDimMapping([1], -1)).toThrow(RangeError);
    expect(() => initDimMapping([1, 1, 1], 3)).toThrow(RangeError);
  });
});
