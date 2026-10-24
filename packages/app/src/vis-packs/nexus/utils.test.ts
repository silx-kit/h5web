import { describe, expect, it } from 'vitest';

import { applyDefaultSlice } from './utils';

describe('applyDefaultSlice', () => {
  it('should apply slicing indices', () => {
    expect(applyDefaultSlice([0], [5])).toEqual([5]);
    expect(applyDefaultSlice([0, 'x'], [5, '.'])).toEqual([5, 'x']);
    expect(
      applyDefaultSlice([0, 0, 'x', 'y', null], [1, 2, '.', '.', '.']),
    ).toEqual([1, 2, 'x', 'y', null]);
  });

  it('should apply slicing indices and remap dimensions', () => {
    expect(applyDefaultSlice([0, 'x'], ['.', 5])).toEqual(['x', 5]);
    expect(
      applyDefaultSlice([0, 0, 'x', 'y', null], ['.', '.', 1, '.', 2]),
    ).toEqual(['x', 'y', 1, null, 2]);
  });

  it('should have no effect when there are no sliceable dimensions', () => {
    expect(applyDefaultSlice([], [])).toEqual([]);
    expect(applyDefaultSlice(['x'], ['.'])).toEqual(['x']);
    expect(applyDefaultSlice(['x', 'y'], ['.', '.'])).toEqual(['x', 'y']);
    expect(applyDefaultSlice(['x', null, null], ['.', '.', '.'])).toEqual([
      'x',
      null,
      null,
    ]);
  });

  it('should have no effect when default slice is incompatible with mapping', () => {
    expect(applyDefaultSlice(['x'], [5])).toEqual(['x']);
    expect(applyDefaultSlice([0], ['.'])).toEqual([0]);
    expect(applyDefaultSlice([0, 'x'], ['.', '.'])).toEqual([0, 'x']);
    expect(applyDefaultSlice([0, null], [5, 5])).toEqual([0, null]);
    expect(applyDefaultSlice(['x', 'y'], ['.', 5])).toEqual(['x', 'y']);
    expect(applyDefaultSlice(['x', null], ['.', 5])).toEqual(['x', null]);
    expect(applyDefaultSlice([0, 0, 'x'], ['.', 5, '.'])).toEqual([0, 0, 'x']);
  });
});
