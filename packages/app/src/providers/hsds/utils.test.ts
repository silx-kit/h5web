import type { DType } from '@h5web/shared/hdf5-models';
import { Endianness } from '@h5web/shared/hdf5-models';
import {
  arrayType,
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  unknownType,
} from '@h5web/shared/hdf5-utils';

import type {
  HsdsArrayType,
  HsdsCompoundType,
  HsdsEnumType,
  HsdsStringType,
  HsdsType,
} from './models';
import { convertHsdsType } from './utils';

interface TestType {
  hsds: HsdsType;
  hdf5: DType;
}

const leInt = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
  hdf5: intType(8, false, Endianness.LE),
} satisfies TestType;

const beInt = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_U64BE' },
  hdf5: intType(64, true, Endianness.BE),
} satisfies TestType;

const leFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F32LE' },
  hdf5: floatType(32, Endianness.LE),
} satisfies TestType;

const beFloat = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F64BE' },
  hdf5: floatType(64, Endianness.BE),
} satisfies TestType;

describe('convertHsdsType', () => {
  it('should convert ASCII string type', () => {
    const asciiStr: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_ASCII',
      length: 25,
    };

    expect(convertHsdsType(asciiStr)).toStrictEqual(strType('ASCII', 25));
  });

  it('should convert variable-length UTF-8 string type', () => {
    const unicodeStr: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_UTF8',
      length: 'H5T_VARIABLE',
    };

    expect(convertHsdsType(unicodeStr)).toStrictEqual(strType('UTF-8'));
  });

  it('should convert integer types', () => {
    expect(convertHsdsType(leInt.hsds)).toStrictEqual(leInt.hdf5);
    expect(convertHsdsType(beInt.hsds)).toStrictEqual(beInt.hdf5);
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

    expect(convertHsdsType(boolEnum)).toStrictEqual(boolType());
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
