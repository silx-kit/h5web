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
      assertScalarValue(
        [0, ''],
        compoundType({
          int: intType(),
          str: strType(),
        }),
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

    expect(() => assertScalarValue(0, compoundType({}))).toThrow(
      'Expected array',
    );
    expect(() =>
      assertScalarValue(0, compoundType({ foo: intType() })),
    ).toThrow('Expected array');
    expect(() =>
      assertScalarValue([], compoundType({ foo: intType() })),
    ).toThrow('Expected number');
    expect(() =>
      assertScalarValue([''], compoundType({ foo: intType() })),
    ).toThrow('Expected number');
  });
});

describe('assertDatasetValue', () => {
  it('should not throw when value satisfies dataset type and shape', () => {
    expect(() =>
      assertDatasetValue(0, dataset('foo', intType(), [])),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(0n, dataset('foo', intType(false, 64), [])),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue('', dataset('foo', strType(), [])),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        [true, false],
        dataset('foo', boolType(intType()), [2]),
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        Float32Array.from([0, 1]),
        dataset('foo', floatType(), [2]),
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        BigInt64Array.from([0n, 1n]),
        dataset('foo', intType(true, 64), [2]),
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        Float32Array.from([0, 1]), // big ints can be returned as any kind of numbers
        dataset('foo', intType(true, 64), [2]),
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        Float32Array.from([0, 1]), // big ints can be returned as any kind of numbers
        dataset('foo', intType(true, 64), [2]),
      ),
    ).not.toThrow();
  });

  it("should throw when value doesn't satisfy dataset type and shape", () => {
    expect(() =>
      assertDatasetValue(
        true,
        dataset('foo', enumType(intType(), { FOO: 0 }), []),
      ),
    ).toThrow('Expected number');

    expect(() =>
      assertDatasetValue(['foo', 'bar'], dataset('foo', intType(), [2])),
    ).toThrow('Expected number');

    expect(() =>
      assertDatasetValue(
        BigInt64Array.from([0n, 1n]),
        dataset('foo', intType(), [2]),
      ),
    ).toThrow('Expected number');
  });

  it('should not throw when value shape satisfies selection', () => {
    expect(() =>
      assertDatasetValue(
        0, // scalar => OK
        dataset('foo', intType(), [1]), // 1D dataset
        '0', // scalar selection (only in "Array" vis)
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        [0], // array => OK
        dataset('foo', intType(), [1]), // 1D dataset
        ':', // entire array
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        0, // scalar => OK
        dataset('foo', intType(), [1, 1]), // 2D dataset
        '0,0', // scalar selection (only in "Array" vis)
      ),
    ).not.toThrow();

    expect(() =>
      assertDatasetValue(
        [0], // array => OK
        dataset('foo', intType(), [1, 1]), // 2D dataset
        '0,:', // 1D slice selection
      ),
    ).not.toThrow();
  });

  it("should throw when value shape doesn't satisfy selection", () => {
    expect(() =>
      assertDatasetValue(
        [0], // array => NOT OK
        dataset('foo', intType(), [1]), // 1D dataset
        '0', // scalar selection (only in "Array" vis)
      ),
    ).toThrow('Expected number');

    expect(() =>
      assertDatasetValue(
        0, // scalar => NOT OK
        dataset('foo', intType(), [1]), // 1D dataset
        ':', // entire array
      ),
    ).toThrow('Expected array or typed array');

    expect(() =>
      assertDatasetValue(
        [0], // array => NOT OK
        dataset('foo', intType(), [1, 1]), // 2D dataset
        '0,0', // scalar selection (only in "Array" vis)
      ),
    ).toThrow('Expected number');

    expect(() =>
      assertDatasetValue(
        0, // scalar => NOT OK
        dataset('foo', intType(), [1, 1]), // 2D dataset
        '0,:', // 1D slice
      ),
    ).toThrow('Expected array');
  });
});
