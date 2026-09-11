import ndarray from 'ndarray';
import { describe, expect, it } from 'vitest';

import { getBounds, toTypedNdArray } from './vis-utils';

function values() {
  return ndarray(Float16Array.from([0, 1.5, -2.5, 3]), [2, 2]);
}

// `ndarray` dispatches on the array's type to decide between indexing and
// getters; an unrecognised typed array falls back to "generic", whose getters a
// typed array does not have, so `.get()` throws. Half-precision datasets
// therefore only work once `ndarray` knows the type.
describe('float16 values', () => {
  it('should be indexable through ndarray', () => {
    const arr = values();
    expect(arr.dtype).toBe('float16');
    expect(arr.get(0, 1)).toBe(1.5);
    expect(arr.get(1, 0)).toBe(-2.5);
  });

  it('should have computable bounds', () => {
    expect(getBounds(values())).toEqual({
      min: -2.5,
      max: 3,
      positiveMin: 0, // zero is in the data; `strictPositiveMin` is the `> 0` one
      strictPositiveMin: 1.5,
    });
  });

  it('should convert losslessly to a texture-safe array', () => {
    // Every half is exactly representable in float32, so widening for the GPU
    // must not perturb the values.
    const converted = toTypedNdArray(values(), Float32Array);
    expect(converted.dtype).toBe('float32');
    expect([...converted.data]).toEqual([0, 1.5, -2.5, 3]);
  });
});
