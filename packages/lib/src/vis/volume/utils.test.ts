import ndarray from 'ndarray';
import {
  FloatType,
  HalfFloatType,
  LinearFilter,
  NearestFilter,
  UnsignedByteType,
} from 'three';
import { describe, expect, it } from 'vitest';

import {
  canAllocateVolumeTexture,
  getBoxSize,
  getVolumeTexture,
  toContiguousArray,
  toNormalizedHalfFloats,
} from './utils';

describe('getBoxSize', () => {
  it('should map dimensions to axes and normalize largest side to 1', () => {
    expect(getBoxSize([10, 20, 40])).toStrictEqual([1, 0.5, 0.25]);
    expect(getBoxSize([64, 64, 64])).toStrictEqual([1, 1, 1]);
  });
});

describe('getVolumeTexture', () => {
  it('should create 3D texture with appropriate size, type and filtering', () => {
    const texture = getVolumeTexture(
      ndarray(new Float32Array(24), [2, 3, 4]),
      true,
    );

    expect(texture.image).toMatchObject({ width: 4, height: 3, depth: 2 });
    expect(texture.type).toBe(FloatType);
    expect(texture.magFilter).toBe(LinearFilter);
  });

  it('should support other texture-safe types', () => {
    const uint8 = ndarray(new Uint8Array(8), [2, 2, 2]);
    const uint16 = ndarray(new Uint16Array(8), [2, 2, 2]);

    expect(getVolumeTexture(uint8, true).type).toBe(UnsignedByteType);
    expect(getVolumeTexture(uint16, true).type).toBe(HalfFloatType);
  });

  it('should fall back to nearest filtering', () => {
    const texture = getVolumeTexture(
      ndarray(new Float32Array(8), [2, 2, 2]),
      false,
    );
    expect(texture.minFilter).toBe(NearestFilter);
  });
});

describe('toContiguousArray', () => {
  it('should return contiguous arrays as is', () => {
    const arr = ndarray(new Float32Array(8), [2, 2, 2]);
    expect(toContiguousArray(arr)).toBe(arr);
  });

  it('should copy views into contiguous arrays', () => {
    const arr = ndarray(
      Float32Array.from({ length: 8 }, (_, i) => i),
      [2, 2, 2],
    );
    const copy = toContiguousArray(arr.transpose(2, 1, 0));
    expect([...copy.data]).toStrictEqual([0, 4, 2, 6, 1, 5, 3, 7]);
  });
});

describe('toNormalizedHalfFloats', () => {
  it('should store values as half floats normalized over data bounds', () => {
    const arr = ndarray(
      Float32Array.from([1000, 1001, 1002, Number.NaN, 1004, Infinity]),
      [1, 2, 3],
    );
    const { values, offset, scale } = toNormalizedHalfFloats(arr);

    expect(values.dtype).toBe('uint16');
    expect(values.shape).toStrictEqual([1, 2, 3]);
    expect(offset).toBe(1000);
    expect(scale).toBe(4);

    const halfFloats = new Float16Array(values.data.buffer);
    const restored = [...halfFloats].map((val) => val * scale + offset);
    expect(restored).toStrictEqual([
      1000,
      1001,
      1002,
      Number.NaN,
      1004,
      Infinity,
    ]);
  });

  it('should handle constant and non-finite volumes', () => {
    const constant = toNormalizedHalfFloats(
      ndarray(Float32Array.from([5, 5, Infinity]), [1, 1, 3]),
    );
    expect(constant.offset).toBe(5);
    expect(constant.scale).toBe(1);
    expect([...new Float16Array(constant.values.data.buffer)]).toStrictEqual([
      0,
      0,
      Infinity,
    ]);

    const nonFinite = toNormalizedHalfFloats(
      ndarray(Float32Array.from([Number.NaN]), [1, 1, 1]),
    );
    expect(nonFinite.offset).toBe(0);
    expect(nonFinite.scale).toBe(1);
  });
});

// Fake WebGL context that records calls and fails `texStorage3D` with the given error
function fakeContext(storageError: number) {
  let error = 0;
  const calls: unknown[][] = [];
  const boundTexture = {};
  const ctx = {
    TEXTURE_3D: 1,
    TEXTURE_BINDING_3D: 2,
    R32F: 3,
    NO_ERROR: 0,
    getParameter: () => boundTexture,
    createTexture: () => ({}),
    bindTexture: (...args: unknown[]) => calls.push(['bindTexture', ...args]),
    deleteTexture: () => calls.push(['deleteTexture']),
    texStorage3D: (...args: unknown[]) => {
      calls.push(['texStorage3D', ...args]);
      error = storageError;
    },
    getError: () => {
      const err = error;
      error = 0;
      return err;
    },
  };
  return { ctx: ctx as unknown as WebGL2RenderingContext, calls, boundTexture };
}

describe('canAllocateVolumeTexture', () => {
  it('should allocate storage without uploading data, and restore binding', () => {
    const { ctx, calls, boundTexture } = fakeContext(0);
    expect(canAllocateVolumeTexture(ctx, [110, 200, 300], ctx.R32F)).toBe(true);
    expect(calls).toContainEqual(['texStorage3D', 1, 1, 3, 300, 200, 110]);
    expect(calls.slice(-2)).toStrictEqual([
      ['bindTexture', 1, boundTexture],
      ['deleteTexture'],
    ]);
  });

  it('should report failed allocations', () => {
    const { ctx, calls } = fakeContext(0x5_02); // INVALID_OPERATION, e.g. texture too large
    expect(canAllocateVolumeTexture(ctx, [110, 2048, 2048], ctx.R32F)).toBe(
      false,
    );
    expect(calls.at(-1)).toStrictEqual(['deleteTexture']);
  });
});
