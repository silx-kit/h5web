import { describe, expect, it } from 'vitest';

import { assertScalarValue, assertValue } from './guards';
import {
  arrayShape,
  arrayType,
  boolType,
  compoundType,
  cplxType,
  enumType,
  floatType,
  intType,
  scalarShape,
  strType,
  vlenType,
} from './hdf5-utils';
import { dataset } from './mock-utils';

describe('assertScalarValue', () => {
  it('should not throw when value satisfies dtype', () => {
    expect(() => assertScalarValue(0, intType())).not.toThrow();
    expect(() => assertScalarValue(0, intType(false))).not.toThrow();
    expect(() => assertScalarValue(0, floatType())).not.toThrow();

    expect(() => assertScalarValue(0, intType(true, 64))).not.toThrow();
    expect(() => assertScalarValue(0n, intType(true, 64))).not.toThrow();

    expect(() => assertScalarValue(0, boolType(intType()))).not.toThrow();
    expect(() => assertScalarValue(false, boolType(intType()))).not.toThrow();

    expect(() =>
      assertScalarValue(0, enumType(intType(), { FOO: 0 })),
    ).not.toThrow();

    expect(() => assertScalarValue('', strType())).not.toThrow();

    expect(() => assertScalarValue([0, 0], cplxType(intType()))).not.toThrow();

    expect(() =>
      assertScalarValue([0, 0], arrayType(intType(), [2])),
    ).not.toThrow();

    expect(() => assertScalarValue([0], vlenType(floatType()))).not.toThrow();

    expect(() =>
      assertScalarValue(
        [0, '', [[]]],
        compoundType([
          ['int', intType()],
          ['str', strType()],
          ['nested', compoundType([['vlen', vlenType(floatType())]])],
        ]),
      ),
    ).not.toThrow();
  });

  it("should throw when value doesn't satisfies dtype", () => {
    expect(() => assertScalarValue('', intType())).toThrow('Expected number');
    expect(() => assertScalarValue(0n, intType())).toThrow('Expected number');
    expect(() => assertScalarValue(true, intType())).toThrow('Expected number');
    expect(() => assertScalarValue([], intType())).toThrow('Expected number');
    expect(() => assertScalarValue(null, intType())).toThrow('Expected number');
    expect(() => assertScalarValue(undefined, intType())).toThrow(
      'Expected number',
    );

    expect(() => assertScalarValue(true, intType(true, 64))).toThrow(
      'Expected number or bigint',
    );

    expect(() => assertScalarValue('', boolType(intType()))).toThrow(
      'Expected number or boolean',
    );

    expect(() =>
      assertScalarValue('', enumType(intType(), { FOO: 0 })),
    ).toThrow('Expected number');

    expect(() => assertScalarValue(0, strType())).toThrow('Expected string');

    expect(() => assertScalarValue(0, cplxType(floatType()))).toThrow(
      'Expected complex',
    );
    expect(() => assertScalarValue([0], cplxType(floatType()))).toThrow(
      'Expected complex',
    );
    expect(() => assertScalarValue([0, ''], cplxType(floatType()))).toThrow(
      'Expected complex',
    );

    expect(() => assertScalarValue(0, compoundType([]))).toThrow(
      'Expected array',
    );
    expect(() =>
      assertScalarValue(0, compoundType([['foo', intType()]])),
    ).toThrow('Expected array');
    expect(() =>
      assertScalarValue([], compoundType([['foo', intType()]])),
    ).toThrow('Expected number');
    expect(() =>
      assertScalarValue([''], compoundType([['foo', intType()]])),
    ).toThrow('Expected number');
  });
});

describe('assertValue', () => {
  it('should not throw when value satisfies dataset type and shape', () => {
    expect(() =>
      assertValue(0, dataset('foo', scalarShape(), intType())),
    ).not.toThrow();

    expect(() =>
      assertValue(0n, dataset('foo', scalarShape(), intType(false, 64))),
    ).not.toThrow();

    expect(() =>
      assertValue('', dataset('foo', scalarShape(), strType())),
    ).not.toThrow();

    expect(() =>
      assertValue(
        [true, false],
        dataset('foo', arrayShape([2]), boolType(intType())),
      ),
    ).not.toThrow();

    expect(() =>
      assertValue(
        Float32Array.from([0, 1]),
        dataset('foo', arrayShape([2]), floatType()),
      ),
    ).not.toThrow();

    expect(() =>
      assertValue(
        BigInt64Array.from([0n, 1n]),
        dataset('foo', arrayShape([2]), intType(true, 64)),
      ),
    ).not.toThrow();

    expect(() =>
      assertValue(
        Float32Array.from([0, 1]), // big ints can be returned as any kind of numbers
        dataset('foo', arrayShape([2]), intType(true, 64)),
      ),
    ).not.toThrow();
  });

  describe('assertDatasetValue', () => {
    it("should throw when value doesn't satisfy dataset type and shape", () => {
      expect(() =>
        assertValue(
          true,
          dataset('foo', scalarShape(), enumType(intType(), { FOO: 0 })),
        ),
      ).toThrow('Expected number');

      expect(() =>
        assertValue(['foo', 'bar'], dataset('foo', arrayShape([2]), intType())),
      ).toThrow('Expected number');

      expect(() =>
        assertValue(
          BigInt64Array.from([0n, 1n]),
          dataset('foo', arrayShape([2]), intType()),
        ),
      ).toThrow('Expected number');
    });
  });
});
