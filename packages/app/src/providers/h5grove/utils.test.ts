import { H5T_CSET, H5T_ORDER } from '@h5web/shared/h5t';
import {
  arrayType,
  bitfieldType,
  boolType,
  compoundType,
  cplxType,
  enumType,
  floatType,
  intType,
  opaqueType,
  referenceType,
  strType,
  timeType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import type { H5GroveType } from './models';
import { parseDType } from './utils';

describe('parseDType', () => {
  it('should convert integer types', () => {
    expect(parseDType({ class: 0, size: 1, order: 0, sign: 1 })).toStrictEqual(
      intType(8, H5T_ORDER.LE),
    );
    expect(parseDType({ class: 0, size: 8, order: 1, sign: 0 })).toStrictEqual(
      uintType(64, H5T_ORDER.BE),
    );
  });

  it('should convert float types', () => {
    expect(parseDType({ class: 1, size: 4, order: 0 })).toStrictEqual(
      floatType(32, H5T_ORDER.LE),
    );
    expect(parseDType({ class: 1, size: 8, order: 1 })).toStrictEqual(
      floatType(64, H5T_ORDER.BE),
    );
  });

  it('should convert string types', () => {
    expect(
      parseDType({ class: 3, size: 6, cset: 0, vlen: false }),
    ).toStrictEqual(strType(H5T_CSET.ASCII, 6));
    expect(
      parseDType({ class: 3, size: 6, cset: 0, vlen: true }),
    ).toStrictEqual(strType(H5T_CSET.ASCII));
    expect(
      parseDType({ class: 3, size: 6, cset: 1, vlen: false }),
    ).toStrictEqual(strType(H5T_CSET.UTF8, 6));
    expect(
      parseDType({ class: 3, size: 6, cset: 1, vlen: true }),
    ).toStrictEqual(strType(H5T_CSET.UTF8));
  });

  it('should convert compound and complex types', () => {
    expect(
      parseDType({
        class: 6,
        size: 4,
        members: { foo: { class: 1, size: 4, order: 0 } },
      }),
    ).toStrictEqual(compoundType({ foo: floatType() }));

    expect(
      parseDType({
        class: 6,
        size: 8,
        members: {
          r: { class: 1, size: 4, order: 0 },
          i: { class: 1, size: 4, order: 0 },
        },
      }),
    ).toStrictEqual(cplxType(floatType(), floatType()));
  });

  it('should convert enum and boolean types', () => {
    expect(
      parseDType({
        class: 8,
        size: 8,
        base: { class: 0, size: 4, order: 0, sign: 0 },
        members: { FOO: 41, BAR: 42 },
      }),
    ).toStrictEqual(enumType(uintType(), { FOO: 41, BAR: 42 }));

    expect(
      parseDType({
        class: 8,
        size: 2,
        base: { class: 0, size: 1, order: 0, sign: 0 },
        members: { FALSE: 0, TRUE: 1 },
      }),
    ).toStrictEqual(boolType());
  });

  it('should convert array types', () => {
    expect(
      parseDType({
        class: 9,
        size: 1,
        base: { class: 1, size: 4, order: 0 },
      }),
    ).toStrictEqual(arrayType(floatType()));

    expect(
      parseDType({
        class: 10,
        size: 1,
        base: { class: 1, size: 4, order: 0 },
        dims: [2, 3],
      }),
    ).toStrictEqual(arrayType(floatType(), [2, 3]));
  });

  it('should convert other types', () => {
    expect(parseDType({ class: 2, size: 1 })).toStrictEqual(timeType());
    expect(parseDType({ class: 4, size: 1, order: 0 })).toStrictEqual(
      bitfieldType(H5T_ORDER.LE),
    );
    expect(parseDType({ class: 5, size: 1, tag: 'foo' })).toStrictEqual(
      opaqueType('foo'),
    );
    expect(parseDType({ class: 7, size: 1 })).toStrictEqual(referenceType());
  });

  it('should handle unknown types', () => {
    expect(
      parseDType({ class: 100, size: 1 } as unknown as H5GroveType),
    ).toStrictEqual(unknownType());
  });
});
