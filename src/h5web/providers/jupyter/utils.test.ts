import Complex from 'complex.js';
import { HDF5Endianness, HDF5TypeClass } from '../hdf5-models';
import type { JupyterComplexValue } from './models';
import { convertDtype, parseComplex } from './utils';

describe('convertDtype', () => {
  it('should convert integer dtypes', () => {
    expect(convertDtype('<i4')).toEqual({
      class: HDF5TypeClass.Integer,
      size: 32,
      endianness: HDF5Endianness.LE,
    });
    expect(convertDtype('>u8')).toEqual({
      class: HDF5TypeClass.Unsigned,
      size: 64,
      endianness: HDF5Endianness.BE,
    });
  });

  it('should convert float dtypes', () => {
    expect(convertDtype('<f4')).toEqual({
      class: HDF5TypeClass.Float,
      size: 32,
      endianness: HDF5Endianness.LE,
    });
    expect(convertDtype('>f8')).toEqual({
      class: HDF5TypeClass.Float,
      size: 64,
      endianness: HDF5Endianness.BE,
    });
  });

  it('should convert complex dtypes', () => {
    expect(convertDtype('<c8')).toEqual({
      class: HDF5TypeClass.Complex,
      realType: {
        class: HDF5TypeClass.Float,
        endianness: HDF5Endianness.LE,
        size: 32,
      },
      imagType: {
        class: HDF5TypeClass.Float,
        endianness: HDF5Endianness.LE,
        size: 32,
      },
    });
  });

  it('should convert bytes string dtypes', () => {
    expect(convertDtype('|S6')).toEqual({
      class: HDF5TypeClass.String,
      charSet: 'ASCII',
      length: 6,
    });
  });

  it('should interpret objects as strings', () => {
    expect(convertDtype('|O')).toEqual({
      class: HDF5TypeClass.String,
      charSet: 'UTF-8',
    });
  });

  it('should interpret |b1 as booleans', () => {
    expect(convertDtype('|b1')).toEqual({ class: HDF5TypeClass.Bool });
  });

  it('should handle "not applicable" endianness symbol', () => {
    expect(convertDtype('|f8')).toEqual({
      class: HDF5TypeClass.Float,
      size: 64,
      endianness: undefined,
    });
  });

  it('should handle unknown type', () => {
    expect(convertDtype('>notAType')).toEqual({ class: HDF5TypeClass.Unknown });
  });
});

describe('parseComplex', () => {
  it('should parse scalar complex', () => {
    expect((parseComplex('(1+5j)') as Complex).equals(new Complex(1, 5))).toBe(
      true
    );
  });

  it('should parse complex array', () => {
    const hsdsComplexArray: JupyterComplexValue[][] = [
      ['0j', '1j'],
      ['(1+0j)', '(1-2j)'],
    ];
    const convertedArray = parseComplex(hsdsComplexArray) as Complex[][];
    expect(convertedArray).toEqual([
      [new Complex(0, 0), new Complex(0, 1)],
      [new Complex(1, 0), new Complex(1, -2)],
    ]);
  });
});
