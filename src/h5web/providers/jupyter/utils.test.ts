import Complex from 'complex.js';
import { HDF5TypeClass } from '../hdf5-models';
import type { JupyterComplexValue } from './models';
import { convertDtype, parseComplex } from './utils';

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
      class: HDF5TypeClass.Complex,
      realType: {
        class: HDF5TypeClass.Float,
        endianness: 'LE',
        size: 32,
      },
      imagType: {
        class: HDF5TypeClass.Float,
        endianness: 'LE',
        size: 32,
      },
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
    expect(() => convertDtype('^f8')).toThrow(/Unknown endianness symbol/);
  });

  it('should throw when encountering an unknown type', () => {
    expect(() => convertDtype('>notAType')).toThrow(/Unknown dtype/);
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
