import { assertDefined } from '@h5web/shared/guards';
import { type Attribute, type NumericType } from '@h5web/shared/hdf5-models';
import { arrayShape, floatType, intType } from '@h5web/shared/hdf5-utils';
import { dataset as mockDataset, scalar } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { type DataContextValue } from '../../providers/DataProvider';
import {
  createIgnoreFillValue,
  getPacking,
  getUnpackedType,
  type Packing,
  unpackArray,
  unpackNumArray,
  unpackValue,
} from './utils';

const PACKING_F64: Packing = {
  scaleFactor: 0.01,
  addOffset: 273.15,
  type: floatType(64),
};

const PACKING_F32: Packing = { ...PACKING_F64, type: floatType(32) };

describe('getUnpackedType', () => {
  it('should return type of single attribute', () => {
    expect(getUnpackedType([floatType(32)])).toEqual(floatType(32));
  });

  it('should prefer widest float type', () => {
    expect(getUnpackedType([floatType(32), floatType(64)])).toEqual(
      floatType(64),
    );
    expect(getUnpackedType([intType(true, 64), floatType(32)])).toEqual(
      floatType(32),
    );
  });

  it('should return widest integer type if no float type', () => {
    expect(getUnpackedType([intType(true, 8), intType(true, 16)])).toEqual(
      intType(true, 16),
    );
  });
});

describe('unpackArray', () => {
  it('should apply scale factor and offset', () => {
    expect(unpackArray([0, 100, -200], PACKING_F64)).toEqual(
      Float64Array.from([273.15, 274.15, 271.15]),
    );
  });

  it('should return float32 array if unpacked type is float32', () => {
    expect(unpackArray([0, 100], PACKING_F32)).toEqual(
      Float32Array.from([273.15, 274.15]),
    );
  });

  it('should support bigints', () => {
    expect(unpackArray([10n], PACKING_F64)).toEqual(
      Float64Array.from([273.25]),
    );
  });

  it('should return array as is without packing', () => {
    const arr = [1, 2];
    expect(unpackArray(arr, undefined)).toBe(arr);
  });
});

describe('createIgnoreFillValue', () => {
  describe('with integers', () => {
    it('should ignore values greater or equal to positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(10, intType());
      expect(ignoreValue(9)).toBe(false);
      expect(ignoreValue(10)).toBe(true);
      expect(ignoreValue(11)).toBe(true);
    });

    it('should ignore values lower or equal to negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-10, intType());
      expect(ignoreValue(-9)).toBe(false);
      expect(ignoreValue(-10)).toBe(true);
      expect(ignoreValue(-11)).toBe(true);
    });
  });

  describe('with floats', () => {
    it('should use tolerance relative to large fill value', () => {
      const fill = Math.fround(-1e30);
      const ignoreValue = createIgnoreFillValue(fill, floatType(32));
      expect(ignoreValue(fill)).toBe(true);
      expect(ignoreValue(fill * (1 - 2 ** -24))).toBe(true);
      expect(ignoreValue(-9.99e29)).toBe(false);
    });

    it('should ignore values greater than positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(0.3, floatType(64));
      expect(ignoreValue(0.2)).toBe(false);
      expect(ignoreValue(0.3005)).toBe(true);
    });

    it('should ignore values close-enough to positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(0.3, floatType(64));
      expect(ignoreValue(0.3 - 2 * Number.EPSILON)).toBe(false);
      expect(ignoreValue(0.3 - Number.EPSILON)).toBe(true);
      expect(ignoreValue(0.3)).toBe(true);
      expect(ignoreValue(0.3 + Number.EPSILON)).toBe(true);
      expect(ignoreValue(0.3 + 2 * Number.EPSILON)).toBe(true);
    });

    it('should ignore values lower than negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-0.3, floatType(64));
      expect(ignoreValue(-0.2)).toBe(false);
      expect(ignoreValue(-0.3005)).toBe(true);
    });

    it('should ignore values close-enough to negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-0.3, floatType(64));
      expect(ignoreValue(-0.3 + 2 * Number.EPSILON)).toBe(false);
      expect(ignoreValue(-0.3 + Number.EPSILON)).toBe(true);
      expect(ignoreValue(-0.3)).toBe(true);
      expect(ignoreValue(-0.3 - Number.EPSILON)).toBe(true);
      expect(ignoreValue(-0.3 - 2 * Number.EPSILON)).toBe(true);
    });
  });
});

function createDataContext(attrValues: Record<string, unknown>) {
  return {
    queryClient: { query: async () => attrValues },
    queries: { attrValues: () => ({}) },
  } as unknown as DataContextValue;
}

async function getTestPacking(
  type: NumericType,
  attributes: Attribute[],
  attrValues: Record<string, unknown>,
): Promise<Packing> {
  const dataset = mockDataset('packed', arrayShape([1]), type, [0], {
    attributes,
  });

  const packing = await getPacking(dataset, createDataContext(attrValues));
  assertDefined(packing);
  return packing;
}

describe('unpackNumArray', () => {
  it('should replace values matching packed integer fill value with NaN', async () => {
    const packing = await getTestPacking(
      intType(true, 16),
      [
        scalar('scale_factor', 0.01, { type: floatType(32) }),
        scalar('add_offset', 273.15, { type: floatType(32) }),
        scalar('_FillValue', -32_767, { type: intType(true, 16) }),
      ],
      { scale_factor: 0.01, add_offset: 273.15, _FillValue: -32_767 },
    );

    const [fill, nextToFill, valid] = unpackNumArray(
      [-32_767, -32_766, 0],
      packing,
    ) as Float32Array;

    expect(fill).toBeNaN();
    expect(nextToFill).toBe(Math.fround(-32_766 * 0.01 + 273.15));
    expect(valid).toBe(Math.fround(273.15));
  });

  it('should detect fill value before lossy unpacking', async () => {
    const packing = await getTestPacking(
      intType(true, 16),
      [
        scalar('scale_factor', 1, { type: floatType(32) }),
        scalar('add_offset', 1e9, { type: floatType(32) }),
        scalar('_FillValue', 1, { type: intType(true, 16) }),
      ],
      { scale_factor: 1, add_offset: 1e9, _FillValue: 1 },
    );

    // Packed 0 and 1 both unpack to 1e9 in float32
    const [valid, fill] = unpackNumArray([0, 1], packing) as Float32Array;
    expect(valid).toBe(1e9);
    expect(fill).toBeNaN();
  });

  it('should detect float fill value in packed space', async () => {
    const packing = await getTestPacking(
      floatType(32),
      [
        scalar('scale_factor', 1, { type: floatType(32) }),
        scalar('add_offset', 1e9, { type: floatType(32) }),
        scalar('_FillValue', 100, { type: floatType(32) }),
      ],
      { scale_factor: 1, add_offset: 1e9, _FillValue: 100 },
    );

    const [valid, fill] = unpackNumArray([0, 100], packing) as Float32Array;
    expect(valid).toBe(1e9);
    expect(fill).toBeNaN();
  });

  it('should check valid range in packed units when types differ', async () => {
    // Same class and size but different signedness
    const packing = await getTestPacking(
      intType(false, 16),
      [
        scalar('scale_factor', 2, { type: intType(true, 16) }),
        mockDataset(
          'valid_range',
          arrayShape([2]),
          intType(false, 16),
          [0, 100],
        ),
      ],
      { scale_factor: 2, valid_range: [0, 100] },
    );

    expect(unpackNumArray([0, 100, 101], packing)).toEqual(
      Float64Array.from([0, 200, Number.NaN]),
    );
  });

  it('should check valid range in unpacked units when types match', async () => {
    const packing = await getTestPacking(
      intType(true, 16),
      [
        scalar('scale_factor', 0.01, { type: floatType(64) }),
        scalar('add_offset', 273.15, { type: floatType(64) }),
        mockDataset(
          'valid_range',
          arrayShape([2]),
          floatType(64),
          [273.15, 274.15],
        ),
      ],
      { scale_factor: 0.01, add_offset: 273.15, valid_range: [273.15, 274.15] },
    );

    const [min, max, aboveMax, belowMin] = unpackNumArray(
      [0, 100, 101, -1],
      packing,
    ) as Float64Array;

    expect(min).toBe(273.15);
    expect(max).toBeCloseTo(274.15); // kept despite rounding errors
    expect(aboveMax).toBeNaN();
    expect(belowMin).toBeNaN();
  });

  it('should support negative scale factor', async () => {
    const packing = await getTestPacking(
      intType(true, 16),
      [
        scalar('scale_factor', -0.5, { type: floatType(64) }),
        scalar('_FillValue', 100, { type: intType(true, 16) }),
      ],
      { scale_factor: -0.5, _FillValue: 100 },
    );

    expect(unpackNumArray([99, 100, 101], packing)).toEqual(
      Float64Array.from([-49.5, Number.NaN, Number.NaN]),
    );
  });

  it('should return array as is without packing', () => {
    const arr = [1, 2];
    expect(unpackNumArray(arr, undefined)).toBe(arr);
  });
});

describe('64-bit integer packing', () => {
  it('should unpack with bigint arithmetic', async () => {
    const packing = await getTestPacking(
      intType(true, 64),
      [scalar('scale_factor', 1n), scalar('add_offset', 1n)],
      { scale_factor: 1n, add_offset: 1n },
    );

    expect(packing.bigInt).toEqual({ scaleFactor: 1n, addOffset: 1n });
    expect(unpackArray([9_007_199_254_740_993n], packing)).toEqual(
      BigInt64Array.from([9_007_199_254_740_994n]),
    );
    expect(unpackValue(9_007_199_254_740_993n, packing)).toBe(
      9_007_199_254_740_994n,
    );
  });

  it('should keep integer valid range in unpacked units exact', async () => {
    const validMax = 1_000_000_000_000_000_000n;
    const packing = await getTestPacking(
      intType(true, 64),
      [scalar('scale_factor', 1n), scalar('valid_max', validMax)],
      { scale_factor: 1n, valid_max: validMax },
    );

    assertDefined(packing.isInvalid);
    expect(packing.isInvalid(validMax)).toBe(false);
    expect(packing.isInvalid(validMax + 1n)).toBe(true); // same `Number` as `validMax`
    expect(packing.isInvalid(validMax + 256n)).toBe(true);
  });

  it('should keep integer valid range in packed units exact', async () => {
    const validMax = 1_000_000_000_000_000_000n;
    const packing = await getTestPacking(
      intType(true, 64),
      [
        scalar('scale_factor', 2n),
        scalar('valid_max', validMax, { type: intType(false, 64) }),
      ],
      { scale_factor: 2n, valid_max: validMax },
    );

    assertDefined(packing.isInvalid);
    expect(packing.isInvalid(validMax)).toBe(false);
    expect(packing.isInvalid(validMax + 1n)).toBe(true);
  });

  it('should compare to 64-bit integer fill value exactly', () => {
    const fillValue = 1_000_000_000_000_000_000n;
    const ignoreValue = createIgnoreFillValue(fillValue, intType(true, 64));

    expect(ignoreValue(fillValue - 1n)).toBe(false); // same `Number` as `fillValue`
    expect(ignoreValue(fillValue)).toBe(true);
  });

  it('should check integer fill value exactly', async () => {
    const packing = await getTestPacking(
      intType(true, 64),
      [
        scalar('scale_factor', 1n),
        scalar('add_offset', 1n),
        scalar('_FillValue', 100n),
      ],
      { scale_factor: 1n, add_offset: 1n, _FillValue: 100n },
    );

    expect(unpackNumArray([99n, 100n], packing)).toEqual(
      Float64Array.from([100, Number.NaN]),
    );
  });
});
