import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import { type DType } from '@h5web/shared/hdf5-models';
import {
  arrayType,
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import {
  type HsdsArrayType,
  type HsdsCompoundType,
  type HsdsEnumType,
  type HsdsStringType,
  type HsdsType,
} from './models';
import { convertHsdsType } from './utils';

interface TestType {
  hsds: HsdsType;
  hdf5: DType;
}

const leInt = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
  hdf5: intType(8, H5T_ORDER.LE),
} satisfies TestType;

const beUint = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_U64BE' },
  hdf5: uintType(64, H5T_ORDER.BE),
} satisfies TestType;

const leFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F32LE' },
  hdf5: floatType(32, H5T_ORDER.LE),
} satisfies TestType;

const beFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F64BE' },
  hdf5: floatType(64, H5T_ORDER.BE),
} satisfies TestType;

describe('convertHsdsType', () => {
  it('should convert ASCII string type', () => {
    const asciiStr: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_ASCII',
      strPad: 'H5T_STR_NULLTERM',
      length: 25,
    };

    expect(convertHsdsType(asciiStr)).toStrictEqual(
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

    expect(convertHsdsType(unicodeStr)).toStrictEqual(
      strType(H5T_CSET.UTF8, H5T_STR.NULLPAD),
    );
  });

  it('should convert integer types', () => {
    expect(convertHsdsType(leInt.hsds)).toStrictEqual(leInt.hdf5);
    expect(convertHsdsType(beUint.hsds)).toStrictEqual(beUint.hdf5);
  });

  it('should convert float types', () => {
    expect(convertHsdsType(leFloat.hsds)).toStrictEqual(leFloat.hdf5);
    expect(convertHsdsType(beFloat.hsds)).toStrictEqual(beFloat.hdf5);
  });

  it('should convert the base of Array type', () => {
    const arr: HsdsArrayType = {
      class: 'H5T_ARRAY',
      base: leInt.hsds,
      dims: [4, 5],
    };

    expect(convertHsdsType(arr)).toStrictEqual(arrayType(leInt.hdf5, [4, 5]));
  });

  it('should convert the base of VLen type', () => {
    const vlen: HsdsArrayType = {
      class: 'H5T_VLEN',
      base: leInt.hsds,
    };

    expect(convertHsdsType(vlen)).toStrictEqual(arrayType(leInt.hdf5));
  });

  it('should convert the field types of Compound type', () => {
    const vlen: HsdsArrayType = {
      class: 'H5T_VLEN',
      base: leInt.hsds,
    };
    const compound: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'f1', type: beFloat.hsds },
        { name: 'f2', type: vlen },
      ],
    };
    expect(convertHsdsType(compound)).toStrictEqual(
      compoundType({
        f1: beFloat.hdf5,
        f2: arrayType(leInt.hdf5),
      }),
    );
  });

  it('should convert the enum with the boolean mapping to Boolean type', () => {
    const boolEnum: HsdsEnumType = {
      class: 'H5T_ENUM',
      base: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
      mapping: { FALSE: 0, TRUE: 1 },
    };

    expect(convertHsdsType(boolEnum)).toStrictEqual(boolType(intType(8)));
  });

  it('should convert the complex compound type into Complex type', () => {
    const complexCompound: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'r', type: leFloat.hsds },
        { name: 'i', type: leFloat.hsds },
      ],
    };

    expect(convertHsdsType(complexCompound)).toEqual(cplxType(leFloat.hdf5));
  });

  it('should handle unknown type', () => {
    expect(
      convertHsdsType({ class: 'NO_CLASS' } as unknown as HsdsType),
    ).toEqual(unknownType());
  });
});
