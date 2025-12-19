import { describe, expect, it } from 'vitest';

import {
  getSlicedDimsAndMapping,
  getSliceSelection,
  initDimMapping,
} from './utils';

describe('initDimMapping', () => {
  it('should map dimensions to axes', () => {
    expect(initDimMapping([], 0)).toStrictEqual([]);
    expect(initDimMapping([1], 1)).toStrictEqual(['x']);
    expect(initDimMapping([1, 1], 2)).toStrictEqual(['y', 'x']);
  });

  it('should initialise extra dimensions for slicing', () => {
    expect(initDimMapping([1], 0)).toStrictEqual([0]);
    expect(initDimMapping([1, 1], 1)).toStrictEqual([0, 'x']);
    expect(initDimMapping([1, 1, 1], 1)).toStrictEqual([0, 0, 'x']);
    expect(initDimMapping([1, 1, 1], 2)).toStrictEqual([0, 'y', 'x']);
    expect(initDimMapping([1, 1, 1, 1], 2)).toStrictEqual([0, 0, 'y', 'x']);
  });

  it('should lock dimensions', () => {
    expect(initDimMapping([1], 0, 1)).toStrictEqual([null]);
    expect(initDimMapping([1, 1, 1], 1, 2)).toStrictEqual(['x', null, null]);
    expect(initDimMapping([1, 1, 1], 2, 1)).toStrictEqual(['y', 'x', null]);
    expect(initDimMapping([1, 1, 1, 1], 2, 1)).toStrictEqual([
      0,
      'y',
      'x',
      null,
    ]);
  });

  it('should cap number of axes and locked dimensions to actual number of dimensions', () => {
    expect(initDimMapping([], 2)).toStrictEqual([]); // axes capped to 0
    expect(initDimMapping([1], 2)).toStrictEqual(['x']); // axes capped to 1
    expect(initDimMapping([], 0, 1)).toStrictEqual([]); // locked dims capped to 0
    expect(initDimMapping([1], 1, 1)).toStrictEqual(['x']); // locked dims capped to 0
    expect(initDimMapping([1], 0, 2)).toStrictEqual([null]); // locked dims capped to 1
    expect(initDimMapping([1], 2, 1)).toStrictEqual(['x']); // axes capped to 1 and locked dims to 0
    expect(initDimMapping([1, 1, 1], 1, 3)).toStrictEqual(['x', null, null]); // locked dims capped to 2
  });

  it('should throw when number of axes or locked dimensions is not supported', () => {
    expect(() => initDimMapping([1], -1)).toThrowError(RangeError);
    expect(() => initDimMapping([1], 1, -1)).toThrowError(RangeError);
    expect(() => initDimMapping([1, 1, 1], 3)).toThrowError(RangeError);
  });
});

describe('getSliceSelection', () => {
  it('should convert dimension mapping with sliceable dimensions', () => {
    expect(getSliceSelection([0])).toBe('0');
    expect(getSliceSelection([0, 0])).toBe('0,0');
    expect(getSliceSelection([0, 'x'])).toBe('0,:');
    expect(getSliceSelection(['x', 5])).toBe(':,5');
    expect(getSliceSelection([0, 0, 'y', 'x'])).toBe('0,0,:,:');
    expect(getSliceSelection([5, 'y', 20, 'x', 10])).toBe('5,:,20,:,10');
  });

  it('should return `undefined` when dimension mapping has no sliceable dimension', () => {
    expect(getSliceSelection()).toBeUndefined();
    expect(getSliceSelection([])).toBeUndefined();
    expect(getSliceSelection(['x'])).toBeUndefined();
    expect(getSliceSelection(['y', 'x'])).toBeUndefined();
  });
});

describe('getSlicedDimsAndMapping', () => {
  it('should compute remaining dimensions and axis mapping after slicing', () => {
    expect(getSlicedDimsAndMapping([10], [2])).toStrictEqual([[], []]);
    expect(getSlicedDimsAndMapping([10, 20], [0, 1])).toStrictEqual([[], []]);
    expect(getSlicedDimsAndMapping([10, 20], ['x', 0])).toStrictEqual([
      [10],
      ['x'],
    ]);
    expect(getSlicedDimsAndMapping([10, 20], [0, 'x'])).toStrictEqual([
      [20],
      ['x'],
    ]);
    expect(
      getSlicedDimsAndMapping([10, 20, 30, 40], [0, 'y', 0, 'x']),
    ).toStrictEqual([
      [20, 40],
      ['y', 'x'],
    ]);
  });

  it('should leave dimensions and mapping unchanged when mapping has no sliceable dimension', () => {
    expect(getSlicedDimsAndMapping([], [])).toStrictEqual([[], []]);
    expect(getSlicedDimsAndMapping([10], ['x'])).toStrictEqual([[10], ['x']]);
    expect(getSlicedDimsAndMapping([10, 20], ['y', 'x'])).toStrictEqual([
      [10, 20],
      ['y', 'x'],
    ]);
    expect(getSlicedDimsAndMapping([10, 20], ['x', 'y'])).toStrictEqual([
      [10, 20],
      ['x', 'y'],
    ]);
  });
});
