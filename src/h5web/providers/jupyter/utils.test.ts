import { HDF5TypeClass } from '../hdf5-models';
import { convertDtype } from './utils';

describe('JupyterProvider utilities', () => {
  describe('convertDtype', () => {
    it('should convert unicode string dtypes', () => {
      expect(convertDtype('|U25')).toEqual({
        class: HDF5TypeClass.String,
        charSet: 'UTF8',
        length: 25,
      });
    });

    it('should convert bytes string dtypes', () => {
      expect(convertDtype('|S')).toEqual({
        class: HDF5TypeClass.String,
        charSet: 'ASCII',
        length: 'H5T_VARIABLE',
      });
    });

    it('should convert integer dtypes', () => {
      expect(convertDtype('<i4')).toEqual({
        class: HDF5TypeClass.Integer,
        size: 32,
        endianness: 'LE',
      });
      expect(convertDtype('>u8')).toEqual({
        class: HDF5TypeClass.Integer,
        size: 64,
        endianness: 'BE',
        unsigned: true,
      });
    });

    it('should convert float dtypes', () => {
      expect(convertDtype('<f4')).toEqual({
        class: HDF5TypeClass.Float,
        size: 32,
        endianness: 'LE',
      });
      expect(convertDtype('>f8')).toEqual({
        class: HDF5TypeClass.Float,
        size: 64,
        endianness: 'BE',
      });
    });

    it('should convert complex dtypes', () => {
      expect(convertDtype('<c8')).toEqual({
        class: HDF5TypeClass.Compound,
        fields: [
          {
            name: 'real',
            type: {
              class: HDF5TypeClass.Float,
              endianness: 'LE',
              size: 32,
            },
          },
          {
            name: 'imag',
            type: {
              class: HDF5TypeClass.Float,
              endianness: 'LE',
              size: 32,
            },
          },
        ],
      });
    });

    it('should interpret objects as strings', () => {
      expect(convertDtype('|O')).toEqual({
        class: HDF5TypeClass.String,
        charSet: 'UTF8',
        length: 'H5T_VARIABLE',
      });
    });

    it('should interpret |b1 as booleans', () => {
      expect(convertDtype('|b1')).toEqual({
        class: HDF5TypeClass.Bool,
      });
    });

    it('should throw when encountering an unknown endianness symbol', () => {
      expect(() => convertDtype('^f8')).toThrow(/Unknown endianness symbol/u);
    });

    it('should throw when encountering an unknown type', () => {
      expect(() => convertDtype('>notAType')).toThrow(/Unknown dtype/u);
    });
  });
});
