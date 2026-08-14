import { H5T_CLASS, H5T_ORDER } from '@h5web/shared/h5t';
import { cplxType, floatType } from '@h5web/shared/hdf5-utils';
import { type Metadata } from 'h5wasm';
import { describe, expect, it } from 'vitest';

import {
  pairComplexComponents,
  parseComplexValue,
  parseDType,
} from './worker-utils';

/* h5wasm's `Metadata` is a wide interface; only the fields read by `parseDType`
 * matter here, so build minimal objects and cast. */
function meta(fields: Partial<Metadata>): Metadata {
  return fields as unknown as Metadata;
}

function complexMeta(size: number, littleEndian = true): Metadata {
  return meta({ type: H5T_CLASS.COMPLEX, size, littleEndian });
}

describe('parseDType', () => {
  /* An `H5T_COMPLEX` carries no metadata describing its base float: both
   * components are the same type, so each is half the itemsize. */
  it('should derive the component type from half the itemsize', () => {
    expect(parseDType(complexMeta(16))).toStrictEqual(
      cplxType(floatType(64, H5T_ORDER.LE)),
    );
    expect(parseDType(complexMeta(8))).toStrictEqual(
      cplxType(floatType(32, H5T_ORDER.LE)),
    );
  });

  it('should carry the byte order over to the components', () => {
    expect(parseDType(complexMeta(16, false))).toStrictEqual(
      cplxType(floatType(64, H5T_ORDER.BE)),
    );
  });
});

describe('pairComplexComponents', () => {
  it('should pair interleaved components', () => {
    expect(pairComplexComponents([1, 2, 3, -4])).toStrictEqual([
      [1, 2],
      [3, -4],
    ]);
  });

  it('should handle an empty array', () => {
    expect(pairComplexComponents([])).toStrictEqual([]);
  });

  it('should reject an odd number of components', () => {
    // Half a complex number cannot be salvaged, so the caller keeps the raw value
    expect(pairComplexComponents([1, 2, 3])).toBeUndefined();
  });

  it('should preserve component precision from a typed array', () => {
    // `Float32Array` rounds 0.1, and the pair must carry that same rounding
    const components = new Float32Array([0.1, 0.2]);

    expect(pairComplexComponents(components)).toStrictEqual([
      [components[0], components[1]],
    ]);
  });

  /* Property: pairing is a pure regrouping - it preserves order and total
   * component count, and flattening the result recovers the input exactly. */
  it('should be a lossless regrouping for any even length', () => {
    for (let count = 0; count <= 8; count += 2) {
      const components = Array.from({ length: count }, (_, i) => i * 1.5 - 3);
      const pairs = pairComplexComponents(components);

      expect(pairs).toHaveLength(count / 2);
      expect(pairs?.flat()).toStrictEqual(components);
    }
  });
});

describe('parseComplexValue', () => {
  it('should return one pair per element of an array dataset', () => {
    expect(parseComplexValue([1, 2, 3, -4], false)).toStrictEqual([
      [1, 2],
      [3, -4],
    ]);
  });

  it('should unwrap a scalar to a bare pair', () => {
    // H5Web's value model for a scalar complex is `[real, imag]`, not `[[real, imag]]`
    expect(parseComplexValue([1, 2], true)).toStrictEqual([1, 2]);
  });

  it('should pass a non-numeric value through untouched', () => {
    // Leave anything unexpected to the caller's type guards rather than mangling it
    const value = { not: 'components' };

    expect(parseComplexValue(value, false)).toBe(value);
    expect(parseComplexValue(['a', 'b'], false)).toStrictEqual(['a', 'b']);
  });
});
