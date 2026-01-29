import { describe, expect, it } from 'vitest';

import { assertScalarValue, assertValue } from './guards';
import {
  arrayShape,
  boolType,
  compoundType,
  cplxType,
  enumType,
  floatType,
  intType,
  scalarShape,
  strType,
} from './hdf5-utils';
import { dataset } from './mock-utils';

describe('assertScalarValue', () => {
  it('should not throw when value satisfies dtype', () => {
    expect(() => assertScalarValue(0, intType())).not.toThrowError();
    expect(() => assertScalarValue(0, intType(false))).not.toThrowError();
    expect(() => assertScalarValue(0, floatType())).not.toThrowError();

    expect(() => assertScalarValue(0, intType(true, 64))).not.toThrowError();
    expect(() => assertScalarValue(0n, intType(true, 64))).not.toThrowError();

    expect(() => assertScalarValue(0, boolType(intType()))).not.toThrowError();
    expect(() =>
      assertScalarValue(false, boolType(intType())),
    ).not.toThrowError();

    expect(() =>
      assertScalarValue(0, enumType(intType(), { FOO: 0 })),
    ).not.toThrowError();

    expect(() => assertScalarValue('', strType())).not.toThrowError();

    expect(() =>
      assertScalarValue([0, 0], cplxType(intType())),
    ).not.toThrowError();

    expect(() =>
      assertScalarValue(
        [0, ''],
        compoundType({
          int: intType(),
          str: strType(),
        }),
      ),
    ).not.toThrowError();
  });

  it("should throw when value doesn't satisfies dtype", () => {
    expect(() => assertScalarValue('', intType())).toThrowError(
      'Expected number',
    );
    expect(() => assertScalarValue(0n, intType())).toThrowError(
      'Expected number',
    );
    expect(() => assertScalarValue(true, intType())).toThrowError(
      'Expected number',
    );
    expect(() => assertScalarValue([], intType())).toThrowError(
      'Expected number',
    );
    expect(() => assertScalarValue(null, intType())).toThrowError(
      'Expected number',
    );
    expect(() => assertScalarValue(undefined, intType())).toThrowError(
      'Expected number',
    );

    expect(() => assertScalarValue(true, intType(true, 64))).toThrowError(
      'Expected number or bigint',
    );

    expect(() => assertScalarValue('', boolType(intType()))).toThrowError(
      'Expected number or boolean',
    );

    expect(() =>
      assertScalarValue('', enumType(intType(), { FOO: 0 })),
    ).toThrowError('Expected number');

    expect(() => assertScalarValue(0, strType())).toThrowError(
      'Expected string',
    );

    expect(() => assertScalarValue(0, cplxType(floatType()))).toThrowError(
      'Expected complex',
    );
    expect(() => assertScalarValue([0], cplxType(floatType()))).toThrowError(
      'Expected complex',
    );
    expect(() =>
      assertScalarValue([0, ''], cplxType(floatType())),
    ).toThrowError('Expected complex');

    expect(() => assertScalarValue(0, compoundType({}))).toThrowError(
      'Expected array',
    );
    expect(() =>
      assertScalarValue(0, compoundType({ foo: intType() })),
    ).toThrowError('Expected array');
    expect(() =>
      assertScalarValue([], compoundType({ foo: intType() })),
    ).toThrowError('Expected number');
    expect(() =>
      assertScalarValue([''], compoundType({ foo: intType() })),
    ).toThrowError('Expected number');
  });
});

describe('assertValue', () => {
  it('should not throw when value satisfies dataset type and shape', () => {
    expect(() =>
      assertValue(0, dataset('foo', scalarShape(), intType())),
    ).not.toThrowError();

    expect(() =>
      assertValue(0n, dataset('foo', scalarShape(), intType(false, 64))),
    ).not.toThrowError();

    expect(() =>
      assertValue('', dataset('foo', scalarShape(), strType())),
    ).not.toThrowError();

    expect(() =>
      assertValue(
        [true, false],
        dataset('foo', arrayShape([2]), boolType(intType())),
      ),
    ).not.toThrowError();

    expect(() =>
      assertValue(
        Float32Array.from([0, 1]),
        dataset('foo', arrayShape([2]), floatType()),
      ),
    ).not.toThrowError();

    expect(() =>
      assertValue(
        BigInt64Array.from([0n, 1n]),
        dataset('foo', arrayShape([2]), intType(true, 64)),
      ),
    ).not.toThrowError();

    expect(() =>
      assertValue(
        Float32Array.from([0, 1]), // big ints can be returned as any kind of numbers
        dataset('foo', arrayShape([2]), intType(true, 64)),
      ),
    ).not.toThrowError();
  });

  describe('assertDatasetValue', () => {
    it("should throw when value doesn't satisfy dataset type and shape", () => {
      expect(() =>
        assertValue(
          true,
          dataset('foo', scalarShape(), enumType(intType(), { FOO: 0 })),
        ),
      ).toThrowError('Expected number');

      expect(() =>
        assertValue(['foo', 'bar'], dataset('foo', arrayShape([2]), intType())),
      ).toThrowError('Expected number');

      expect(() =>
        assertValue(
          BigInt64Array.from([0n, 1n]),
          dataset('foo', arrayShape([2]), intType()),
        ),
      ).toThrowError('Expected number');
    });
  });
});
