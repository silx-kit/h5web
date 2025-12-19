import { describe, expect, it } from 'vitest';

import { assertDatasetValue, assertScalarValue } from './guards';
import {
  boolType,
  compoundType,
  cplxType,
  enumType,
  floatType,
  intType,
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

describe('assertDatasetValue', () => {
  it('should not throw when value satisfies dataset type and shape', () => {
    expect(() =>
      assertDatasetValue(0, dataset('foo', intType(), [])),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue(0n, dataset('foo', intType(false, 64), [])),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue('', dataset('foo', strType(), [])),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue(
        [true, false],
        dataset('foo', boolType(intType()), [2]),
      ),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue(
        Float32Array.from([0, 1]),
        dataset('foo', floatType(), [2]),
      ),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue(
        BigInt64Array.from([0n, 1n]),
        dataset('foo', intType(true, 64), [2]),
      ),
    ).not.toThrowError();

    expect(() =>
      assertDatasetValue(
        Float32Array.from([0, 1]), // big ints can be returned as any kind of numbers
        dataset('foo', intType(true, 64), [2]),
      ),
    ).not.toThrowError();
  });

  describe('assertDatasetValue', () => {
    it("should throw when value doesn't satisfy dataset type and shape", () => {
      expect(() =>
        assertDatasetValue(
          true,
          dataset('foo', enumType(intType(), { FOO: 0 }), []),
        ),
      ).toThrowError('Expected number');

      expect(() =>
        assertDatasetValue(['foo', 'bar'], dataset('foo', intType(), [2])),
      ).toThrowError('Expected number');

      expect(() =>
        assertDatasetValue(
          BigInt64Array.from([0n, 1n]),
          dataset('foo', intType(), [2]),
        ),
      ).toThrowError('Expected number');
    });
  });
});
