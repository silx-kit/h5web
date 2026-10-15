import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import { type DType } from '@h5web/shared/hdf5-models';
import {
  arrayType,
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  opaqueType,
  referenceType,
  strType,
  unknownType,
  vlenType,
} from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import {
  type HsdsArrayType,
  type HsdsCompoundType,
  type HsdsEnumType,
  type HsdsStringType,
  type HsdsType,
  type HsdsVLenType,
} from './models';
import { parseType } from './utils';

interface TestType {
  hsds: HsdsType;
  hdf5: DType;
}

const leInt = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
  hdf5: intType(true, 8, H5T_ORDER.LE),
} satisfies TestType;

const beUint = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_U64BE' },
  hdf5: intType(false, 64, H5T_ORDER.BE),
} satisfies TestType;

const leFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F32LE' },
  hdf5: floatType(32, H5T_ORDER.LE),
} satisfies TestType;

const beFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F64BE' },
  hdf5: floatType(64, H5T_ORDER.BE),
} satisfies TestType;

describe('parseType', () => {
  it('should convert ASCII string type', () => {
    const asciiStr: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_ASCII',
      strPad: 'H5T_STR_NULLTERM',
      length: 25,
    };

    expect(parseType(asciiStr)).toStrictEqual(
      strType(H5T_CSET.ASCII, H5T_STR.NULLTERM, 25),
    );
  });

  it('should convert variable-length UTF-8 string type', () => {
    const unicodeStr: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_UTF8',
      strPad: 'H5T_STR_NULLPAD',
      length: 'H5T_VARIABLE',
    };

    expect(parseType(unicodeStr)).toStrictEqual(
      strType(H5T_CSET.UTF8, H5T_STR.NULLPAD),
    );
  });

  it('should convert integer types', () => {
    expect(parseType(leInt.hsds)).toStrictEqual(leInt.hdf5);
    expect(parseType(beUint.hsds)).toStrictEqual(beUint.hdf5);
  });

  it('should convert float types', () => {
    expect(parseType(leFloat.hsds)).toStrictEqual(leFloat.hdf5);
    expect(parseType(beFloat.hsds)).toStrictEqual(beFloat.hdf5);
  });

  it('should convert vlen type', () => {
    const vlen: HsdsVLenType = {
      class: 'H5T_VLEN',
      base: leInt.hsds,
    };

    expect(parseType(vlen)).toStrictEqual(vlenType(leInt.hdf5));
  });

  it('should convert array type', () => {
    const arr: HsdsArrayType = {
      class: 'H5T_ARRAY',
      base: leInt.hsds,
      dims: [4, 5],
    };

    expect(parseType(arr)).toStrictEqual(arrayType(leInt.hdf5, [4, 5]));
  });

  it('should convert compound type', () => {
    const vlen: HsdsVLenType = { class: 'H5T_VLEN', base: leInt.hsds };
    const compound: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'f1', type: beFloat.hsds },
        { name: 'f2', type: vlen },
      ],
    };
    expect(parseType(compound)).toStrictEqual(
      compoundType([
        ['f1', beFloat.hdf5],
        ['f2', vlenType(leInt.hdf5)],
      ]),
    );
  });

  it('should convert enum and boolean types', () => {
    const boolEnum: HsdsEnumType = {
      class: 'H5T_ENUM',
      base: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
      members: [
        { name: 'FALSE', value: 0 },
        { name: 'TRUE', value: 1 },
      ],
    };

    expect(parseType(boolEnum)).toStrictEqual(boolType(intType(true, 8)));
  });

  it('should convert complex type', () => {
    const complexCompound: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'r', type: leFloat.hsds },
        { name: 'i', type: leFloat.hsds },
      ],
    };

    expect(parseType(complexCompound)).toEqual(cplxType(leFloat.hdf5));
  });

  it('should convert other types', () => {
    expect(parseType({ class: 'H5T_REFERENCE' })).toStrictEqual(
      referenceType(),
    );
    expect(parseType({ class: 'H5T_OPAQUE' })).toStrictEqual(opaqueType());
  });

  it('should handle unknown type', () => {
    expect(parseType({ class: 'NO_CLASS' } as unknown as HsdsType)).toEqual(
      unknownType(),
    );
  });
});
