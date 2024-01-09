import { DTypeClass, Endianness } from '@h5web/shared/hdf5-models';

import { convertH5GroveDtype } from './utils';

describe('convertH5GroveDtype', () => {
  it('should convert integer dtypes', () => {
    expect(convertH5GroveDtype('<i4')).toEqual({
      class: DTypeClass.Integer,
      size: 32,
      endianness: Endianness.LE,
    });
    expect(convertH5GroveDtype('>u8')).toEqual({
      class: DTypeClass.Unsigned,
      size: 64,
      endianness: Endianness.BE,
    });
  });

  it('should convert float dtypes', () => {
    expect(convertH5GroveDtype('<f4')).toEqual({
      class: DTypeClass.Float,
      size: 32,
      endianness: Endianness.LE,
    });
    expect(convertH5GroveDtype('>f8')).toEqual({
      class: DTypeClass.Float,
      size: 64,
      endianness: Endianness.BE,
    });
  });

  it('should convert complex dtypes', () => {
    expect(convertH5GroveDtype('<c8')).toEqual({
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
    expect(convertH5GroveDtype('|S6')).toEqual({
      class: DTypeClass.String,
      charSet: 'ASCII',
      length: 6,
    });
  });

  it('should interpret objects as strings', () => {
    expect(convertH5GroveDtype('|O')).toEqual({
      class: DTypeClass.String,
      charSet: 'UTF-8',
    });
  });

  it('should interpret |b1 as booleans', () => {
    expect(convertH5GroveDtype('|b1')).toEqual({ class: DTypeClass.Bool });
  });

  it('should handle "not applicable" endianness symbol', () => {
    expect(convertH5GroveDtype('|f8')).toEqual({
      class: DTypeClass.Float,
      size: 64,
      endianness: undefined,
    });
  });

  it('should convert compound dtype', () => {
    expect(convertH5GroveDtype({ country: '|S10', population: '<i4' })).toEqual(
      {
        class: DTypeClass.Compound,
        fields: {
          country: {
            class: DTypeClass.String,
            charSet: 'ASCII',
            length: 10,
          },
          population: {
            class: DTypeClass.Integer,
            endianness: Endianness.LE,
            size: 32,
          },
        },
      },
    );
  });

  it('should handle unknown type', () => {
    expect(convertH5GroveDtype('>notAType')).toEqual({
      class: DTypeClass.Unknown,
    });
  });
});
