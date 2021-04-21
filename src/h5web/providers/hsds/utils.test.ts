import { Endianness, DType, DTypeClass } from '../models';
import type {
  HsdsStringType,
  HsdsArrayType,
  HsdsCompoundType,
  HsdsEnumType,
  HsdsType,
} from './models';
import { convertHsdsType } from './utils';

interface TestType {
  hsds: HsdsType;
  hdf5: DType;
}

const leIntegerType: TestType = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
  hdf5: {
    class: DTypeClass.Integer,
    size: 8,
    endianness: Endianness.LE,
  },
};

const beIntegerType: TestType = {
  hsds: { class: 'H5T_INTEGER', base: 'H5T_STD_U64BE' },
  hdf5: {
    class: DTypeClass.Unsigned,
    size: 64,
    endianness: Endianness.BE,
  },
};

const leFloatType: TestType = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F32LE' },
  hdf5: { class: DTypeClass.Float, size: 32, endianness: Endianness.LE },
};

const beFloatType: TestType = {
  hsds: { class: 'H5T_FLOAT', base: 'H5T_IEEE_F64BE' },
  hdf5: { class: DTypeClass.Float, size: 64, endianness: Endianness.BE },
};

describe('convertHsdsType', () => {
  it('should convert ASCII string type', () => {
    const asciiStrType: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_ASCII',
      length: 25,
    };
    expect(convertHsdsType(asciiStrType)).toEqual({
      class: DTypeClass.String,
      charSet: 'ASCII',
      length: 25,
    });
  });

  it('should convert variable-length UTF-8 string type', () => {
    const unicodeStrType: HsdsStringType = {
      class: 'H5T_STRING',
      charSet: 'H5T_CSET_UTF8',
      length: 'H5T_VARIABLE',
    };

    expect(convertHsdsType(unicodeStrType)).toEqual({
      class: DTypeClass.String,
      charSet: 'UTF-8',
    });
  });

  it('should convert integer types', () => {
    expect(convertHsdsType(leIntegerType.hsds)).toEqual(leIntegerType.hdf5);
    expect(convertHsdsType(beIntegerType.hsds)).toEqual(beIntegerType.hdf5);
  });

  it('should convert float types', () => {
    expect(convertHsdsType(leFloatType.hsds)).toEqual(leFloatType.hdf5);
    expect(convertHsdsType(beFloatType.hsds)).toEqual(beFloatType.hdf5);
  });

  it('should convert the base of Array type', () => {
    const arrayType: HsdsArrayType = {
      class: 'H5T_ARRAY',
      base: leIntegerType.hsds,
      dims: [4, 5],
    };
    expect(convertHsdsType(arrayType)).toEqual({
      class: DTypeClass.Array,
      base: leIntegerType.hdf5,
      dims: [4, 5],
    });
  });

  it('should convert the base of VLen type', () => {
    const vlenType: HsdsArrayType = {
      class: 'H5T_VLEN',
      base: leIntegerType.hsds,
    };
    expect(convertHsdsType(vlenType)).toEqual({
      class: DTypeClass.VLen,
      base: leIntegerType.hdf5,
    });
  });

  it('should convert the field types of Compound type', () => {
    const vlenType: HsdsArrayType = {
      class: 'H5T_VLEN',
      base: leIntegerType.hsds,
    };
    const compoundType: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'f1', type: beFloatType.hsds },
        { name: 'f2', type: vlenType },
      ],
    };
    expect(convertHsdsType(compoundType)).toEqual({
      class: DTypeClass.Compound,
      fields: {
        f1: beFloatType.hdf5,
        f2: { class: DTypeClass.VLen, base: leIntegerType.hdf5 },
      },
    });
  });

  it('should convert the enum with the boolean mapping to Boolean type', () => {
    const boolEnum: HsdsEnumType = {
      class: 'H5T_ENUM',
      base: { class: 'H5T_INTEGER', base: 'H5T_STD_I8LE' },
      mapping: { FALSE: 0, TRUE: 1 },
    };
    expect(convertHsdsType(boolEnum)).toEqual({
      class: DTypeClass.Bool,
    });
  });

  it('should convert the complex compound type into Complex type', () => {
    const complexCompound: HsdsCompoundType = {
      class: 'H5T_COMPOUND',
      fields: [
        { name: 'r', type: leFloatType.hsds },
        { name: 'i', type: leFloatType.hsds },
      ],
    };
    expect(convertHsdsType(complexCompound)).toEqual({
      class: DTypeClass.Complex,
      realType: leFloatType.hdf5,
      imagType: leFloatType.hdf5,
    });
  });

  it('should handle unknown type', () => {
    const unknownType = { class: 'NO_CLASS' };
    expect(convertHsdsType(unknownType as HsdsType)).toEqual({
      class: DTypeClass.Unknown,
    });
  });
});
