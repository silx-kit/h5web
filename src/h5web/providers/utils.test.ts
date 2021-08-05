import { Endianness, DTypeClass } from './models';
import { convertDtype, encodeQueryParams } from './utils';

describe('convertDtype', () => {
  it('should convert integer dtypes', () => {
    expect(convertDtype('<i4')).toEqual({
      class: DTypeClass.Integer,
      size: 32,
      endianness: Endianness.LE,
    });
    expect(convertDtype('>u8')).toEqual({
      class: DTypeClass.Unsigned,
      size: 64,
      endianness: Endianness.BE,
    });
  });

  it('should convert float dtypes', () => {
    expect(convertDtype('<f4')).toEqual({
      class: DTypeClass.Float,
      size: 32,
      endianness: Endianness.LE,
    });
    expect(convertDtype('>f8')).toEqual({
      class: DTypeClass.Float,
      size: 64,
      endianness: Endianness.BE,
    });
  });

  it('should convert complex dtypes', () => {
    expect(convertDtype('<c8')).toEqual({
      class: DTypeClass.Complex,
      realType: {
        class: DTypeClass.Float,
        endianness: Endianness.LE,
        size: 32,
      },
      imagType: {
        class: DTypeClass.Float,
        endianness: Endianness.LE,
        size: 32,
      },
    });
  });

  it('should convert bytes string dtypes', () => {
    expect(convertDtype('|S6')).toEqual({
      class: DTypeClass.String,
      charSet: 'ASCII',
      length: 6,
    });
  });

  it('should interpret objects as strings', () => {
    expect(convertDtype('|O')).toEqual({
      class: DTypeClass.String,
      charSet: 'UTF-8',
    });
  });

  it('should interpret |b1 as booleans', () => {
    expect(convertDtype('|b1')).toEqual({ class: DTypeClass.Bool });
  });

  it('should handle "not applicable" endianness symbol', () => {
    expect(convertDtype('|f8')).toEqual({
      class: DTypeClass.Float,
      size: 64,
      endianness: undefined,
    });
  });

  it('should handle unknown type', () => {
    expect(convertDtype('>notAType')).toEqual({ class: DTypeClass.Unknown });
  });
});

describe('encodeQueryParams', () => {
  it('should convert a record into a query string', () => {
    expect(encodeQueryParams({ file: 'a_file.h5', format: 'json' })).toEqual(
      'file=a_file.h5&format=json'
    );
  });

  it('should encode special characters', () => {
    expect(encodeQueryParams({ file: 'a+file.h5', path: '/' })).toEqual(
      'file=a%2Bfile.h5&path=%2F'
    );
  });
});
