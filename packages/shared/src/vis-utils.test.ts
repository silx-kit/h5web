import ndarray, { type NdArray } from 'ndarray';
import { describe, expect, it } from 'vitest';

import { type ArrayValue } from './hdf5-models';
import {
  createArrayFromView,
  getBounds,
  getBoundsWithErrors,
} from './vis-utils';

function range(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

// Naive reference: read every element of the view in C order with `get`
function referenceCopy(view: NdArray<ArrayValue>) {
  const values: unknown[] = [];
  const indices = view.shape.map(() => 0);

  for (let i = 0; i < view.size; i += 1) {
    values.push(view.get(...indices));

    for (let dim = indices.length - 1; dim >= 0; dim -= 1) {
      indices[dim] += 1;
      if (indices[dim] < view.shape[dim]) {
        break;
      }
      indices[dim] = 0;
    }
  }

  return {
    type: view.data.constructor,
    shape: view.shape,
    offset: 0,
    isSameData: false,
    values,
  };
}

function actualCopy(view: NdArray<ArrayValue>) {
  const { data, shape, offset } = createArrayFromView(view);

  return {
    type: data.constructor,
    shape,
    offset,
    isSameData: data === view.data,
    values: [...data],
  };
}

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

describe('createArrayFromView', () => {
  const arr4d = ndarray(Float64Array.from(range(2 * 3 * 4 * 5)), [2, 3, 4, 5]);

  it('should copy 0-D views', () => {
    const views = [
      ndarray(new Float32Array([42]), []),
      arr4d.pick(1, 2, 3, 4),
      arr4d.pick(1, 0, 2, null).pick(3),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy 1-D views', () => {
    const arr = ndarray(Int16Array.from(range(10)), [10]);

    const views = [
      arr,
      arr.lo(3),
      arr.hi(7).lo(2),
      arr.step(3),
      arr.step(-1),
      arr.lo(1).step(-4),
      arr4d.pick(1, null, 2, 3),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy transposed views', () => {
    const arr = ndarray(Float32Array.from(range(12)), [3, 4]);
    expect(actualCopy(arr.transpose(1, 0)).values).toEqual([
      0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11,
    ]);

    const views = [
      arr.transpose(1, 0),
      arr4d.transpose(3, 1, 0, 2),
      arr4d.transpose(1, 0, 3, 2).lo(1, 1, 1, 0),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy stepped and sliced N-D views', () => {
    const views = [
      arr4d.lo(1, 1, 1, 1),
      arr4d.hi(2, 2, 3, 4).lo(0, 1, 1, 2),
      arr4d.step(1, -1, 2, -2),
      arr4d.step(-1, 2, -3, 1).lo(0, 0, 0, 1),
      arr4d.pick(null, 1, null, null).step(1, -1, 2),
      arr4d.pick(null, null, null, 2).transpose(2, 0, 1),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy contiguous views and views with length-1 dimensions', () => {
    const views = [
      arr4d,
      arr4d.pick(1),
      arr4d.pick(1, 2),
      arr4d.lo(1).hi(1),
      arr4d.lo(0, 1).hi(2, 1),
      arr4d.lo(0, 0, 0, 3).hi(2, 3, 4, 1),
      ndarray(Float64Array.from(range(6)), [1, 6, 1]),
      ndarray(Float64Array.from(range(6)), [6, 1], [1, 6]),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy views with zero strides', () => {
    const views = [
      ndarray(Uint8Array.from(range(4)), [3, 4], [0, 1]),
      ndarray(Uint8Array.from(range(4)), [4, 3], [1, 0], 0),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy empty views', () => {
    const views = [
      ndarray(new Float32Array(0), [0]),
      arr4d.hi(2, 0, 4, 5),
      arr4d.lo(0, 0, 0, 5).transpose(3, 0, 1, 2),
    ];
    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy views spanning multiple tiles', () => {
    // Larger than tile size (64) and not a multiple of it
    const values = range(3 * 70 * 130);

    const views = [
      Float32Array.from(values),
      Float64Array.from(values),
      Uint8Array.from(values),
      values,
    ].flatMap((data) => {
      const arr = ndarray(data, [3, 70, 130]);
      return [
        arr.transpose(2, 1, 0),
        arr.transpose(0, 2, 1).lo(0, 5, 3),
        arr.pick(1).transpose(1, 0).step(-1, 2),
        arr.step(1, -1, 3).transpose(1, 2, 0),
      ];
    });

    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should copy random views', () => {
    // Deterministic PRNG (Park-Miller) so that failures are reproducible
    let seed = 2047;
    function randInt(max: number): number {
      seed = (seed * 16_807) % 2_147_483_647;
      return seed % max;
    }

    const views = range(500).map(() => {
      const shape = range(1 + randInt(4)).map(() => 1 + randInt(5));
      const size = shape.reduce((acc, len) => acc * len, 1);

      const view = ndarray(Float64Array.from(range(size)), shape)
        .lo(...shape.map((len) => randInt(len)))
        .step(...shape.map(() => (1 + randInt(3)) * (randInt(2) ? 1 : -1)))
        .transpose(...range(shape.length).sort(() => randInt(3) - 1));

      return randInt(3) === 0 ? view.pick(randInt(view.shape[0])) : view;
    });

    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));
  });

  it('should preserve typed array constructor', () => {
    const values = range(12).map((i) => (i - 6) * 1000.5); // incl. negatives

    const views = [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
    ].flatMap((Constructor) => {
      const arr = ndarray(Constructor.from(values), [3, 4]);
      return [arr, arr.transpose(1, 0), arr.step(-1, 2)];
    });

    const bigViews = [BigInt64Array, BigUint64Array].flatMap((Constructor) => {
      const arr = ndarray(
        Constructor.from(values.map((v) => BigInt(Math.trunc(v)))),
        [3, 4],
      );
      return [arr, arr.transpose(1, 0).lo(1, 1)];
    });

    const allViews = [...views, ...bigViews];
    expect(allViews.map(actualCopy)).toEqual(allViews.map(referenceCopy));
  });

  it('should not share storage with source', () => {
    // Like Node.js `Buffer`, whose `slice` doesn't copy
    class SharingArray extends Uint8Array {
      public override slice(
        start?: number,
        end?: number,
      ): Uint8Array<ArrayBuffer> {
        return this.subarray(start, end);
      }
    }

    const source = SharingArray.from(range(6));
    const { data } = createArrayFromView(ndarray(source, [2, 3]));
    data[0] = 42;
    expect(source[0]).toBe(0);
  });

  it('should copy plain arrays of any value', () => {
    const compounds = range(6).map((i) => [i, `${i}`]);

    const views = [
      range(6),
      range(6).map(String),
      range(6).map((i) => i % 2 === 0),
      range(6).map(BigInt),
      compounds,
    ].flatMap((values) => {
      const arr = ndarray(values, [2, 3]);
      return [arr, arr.transpose(1, 0), arr.step(-1, -2)];
    });

    expect(views.map(actualCopy)).toEqual(views.map(referenceCopy));

    // Preserve object references (e.g. compound values)
    const { data } = createArrayFromView(
      ndarray(compounds, [2, 3]).transpose(1, 0),
    );
    expect(data[0]).toBe(compounds[0]);
    expect(data[1]).toBe(compounds[3]);
  });
});
