import {
  HDF5BaseType,
  HDF5Id,
  HDF5StringType,
  HDF5TypeClass,
} from '../hdf5-models';
import type {
  HsdsArrayType,
  HsdsBaseType,
  HsdsCompoundType,
  HsdsType,
  HsdsVLenType,
} from './models';
import { convertHsdsType } from './utils';

describe('HsdsProvider utilities', () => {
  describe('convertHsdsType', () => {
    interface TestType {
      hsds: HsdsBaseType;
      hdf5: HDF5BaseType;
    }

    const leIntegerType: TestType = {
      hsds: {
        class: HDF5TypeClass.Integer,
        base: 'H5T_STD_I8LE',
      },
      hdf5: {
        class: HDF5TypeClass.Integer,
        size: 8,
        endianness: 'LE',
      },
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
      hsds: {
        class: HDF5TypeClass.Float,
        base: 'H5T_IEEE_F32LE',
      },
      hdf5: {
        class: HDF5TypeClass.Float,
        size: 32,
        endianness: 'LE',
      },
    };

    const beFloatType: TestType = {
      hsds: {
        class: HDF5TypeClass.Float,
        base: 'H5T_IEEE_F64BE',
      },
      hdf5: {
        class: HDF5TypeClass.Float,
        size: 64,
        endianness: 'BE',
      },
    };

    it('should left HDF5Id type unchanged', () => {
      const idType: HDF5Id = 'aHdfId';
      expect(convertHsdsType(idType)).toBe(idType);
    });

    it('should left string type unchanged', () => {
      const stringType: HDF5StringType = {
        class: HDF5TypeClass.String,
        charSet: 'H5T_CSET_UTF8',
        strPad: 'H5T_STR_NULLPAD',
        length: 25,
      };
      expect(convertHsdsType(stringType)).toBe(stringType);
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
            type: {
              class: HDF5TypeClass.VLen,
              base: leIntegerType.hdf5,
            },
          },
        ],
      });
    });

    it('should throw when encountering an unknown type', () => {
      const unknownType = { class: 'NO_CLASS' };
      expect(() => convertHsdsType(unknownType as HsdsType)).toThrow(
        /Unknown type/u
      );
    });
  });
});
