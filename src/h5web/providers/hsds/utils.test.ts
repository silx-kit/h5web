import Complex from 'complex.js';
import { HDF5Type, HDF5TypeClass } from '../hdf5-models';
import type {
  HsdsStringType,
  HsdsArrayType,
  HsdsComplexValue,
  HsdsCompoundType,
  HsdsEnumType,
  HsdsType,
  HsdsVLenType,
} from './models';
import { convertHsdsType, parseComplex } from './utils';

interface TestType {
  hsds: HsdsType;
  hdf5: HDF5Type;
}

const leIntegerType: TestType = {
  hsds: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I8LE' },
  hdf5: { class: HDF5TypeClass.Integer, size: 8, endianness: 'LE' },
};

const beIntegerType: TestType = {
  hsds: { class: HDF5TypeClass.Integer, base: 'H5T_STD_U64BE' },
  hdf5: {
    class: HDF5TypeClass.Integer,
    size: 64,
    endianness: 'BE',
    unsigned: true,
  },
};

const leFloatType: TestType = {
  hsds: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F32LE' },
  hdf5: { class: HDF5TypeClass.Float, size: 32, endianness: 'LE' },
};

const beFloatType: TestType = {
  hsds: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64BE' },
  hdf5: { class: HDF5TypeClass.Float, size: 64, endianness: 'BE' },
};

describe('convertHsdsType', () => {
  it('should convert ASCII string type', () => {
    const asciiStrType: HsdsStringType = {
      class: HDF5TypeClass.String,
      charSet: 'H5T_CSET_ASCII',
      strPad: 'H5T_STR_NULLPAD',
      length: 25,
    };
    expect(convertHsdsType(asciiStrType)).toEqual({
      class: HDF5TypeClass.String,
      charSet: 'ASCII',
      length: 25,
    });
  });

  it('should convert Unicode string type', () => {
    const unicodeStrType: HsdsStringType = {
      class: HDF5TypeClass.String,
      charSet: 'H5T_CSET_UTF8',
      strPad: 'H5T_STR_NULLTERM',
      length: 49,
    };

    expect(convertHsdsType(unicodeStrType)).toEqual({
      class: HDF5TypeClass.String,
      charSet: 'UTF8',
      length: 49,
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
      class: HDF5TypeClass.Array,
      base: leIntegerType.hsds,
      dims: [4, 5],
    };
    expect(convertHsdsType(arrayType)).toEqual({
      class: HDF5TypeClass.Array,
      base: leIntegerType.hdf5,
      dims: [4, 5],
    });
  });

  it('should convert the base of VLen type', () => {
    const vlenType: HsdsVLenType = {
      class: HDF5TypeClass.VLen,
      base: leIntegerType.hsds,
    };
    expect(convertHsdsType(vlenType)).toEqual({
      class: HDF5TypeClass.VLen,
      base: leIntegerType.hdf5,
    });
  });

  it('should convert the field types of Compound type', () => {
    const vlenType: HsdsVLenType = {
      class: HDF5TypeClass.VLen,
      base: leIntegerType.hsds,
    };
    const compoundType: HsdsCompoundType = {
      class: HDF5TypeClass.Compound,
      fields: [
        { name: 'f1', type: beFloatType.hsds },
        { name: 'f2', type: vlenType },
      ],
    };
    expect(convertHsdsType(compoundType)).toEqual({
      class: HDF5TypeClass.Compound,
      fields: [
        { name: 'f1', type: beFloatType.hdf5 },
        {
          name: 'f2',
          type: { class: HDF5TypeClass.VLen, base: leIntegerType.hdf5 },
        },
      ],
    });
  });

  it('should convert the enum with the boolean mapping to Boolean type', () => {
    const boolEnum: HsdsEnumType = {
      class: HDF5TypeClass.Enum,
      base: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I8LE' },
      mapping: { FALSE: 0, TRUE: 1 },
    };
    expect(convertHsdsType(boolEnum)).toEqual({
      class: HDF5TypeClass.Bool,
    });
  });

  it('should convert the complex compound type into Complex type', () => {
    const complexCompound: HsdsCompoundType = {
      class: HDF5TypeClass.Compound,
      fields: [
        { name: 'r', type: leFloatType.hsds },
        { name: 'i', type: leFloatType.hsds },
      ],
    };
    expect(convertHsdsType(complexCompound)).toEqual({
      class: HDF5TypeClass.Complex,
      realType: leFloatType.hdf5,
      imagType: leFloatType.hdf5,
    });
  });

  it('should handle unknown type', () => {
    const unknownType = { class: 'NO_CLASS' };
    expect(convertHsdsType(unknownType as HsdsType)).toEqual({
      class: HDF5TypeClass.Unknown,
    });
  });
});

describe('parseComplex', () => {
  it('should parse scalar complex', () => {
    expect((parseComplex([1, 5]) as Complex).equals(new Complex(1, 5))).toBe(
      true
    );
  });

  it('should parse complex array', () => {
    const hsdsComplexArray: HsdsComplexValue[][] = [
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [2, 1],
      ],
    ];
    const convertedArray = parseComplex(hsdsComplexArray) as Complex[][];
    expect(convertedArray).toEqual([
      [new Complex(0, 0), new Complex(0, 1)],
      [new Complex(1, 0), new Complex(2, 1)],
    ]);
  });
});
