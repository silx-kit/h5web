import { Endianness } from '@h5web/shared/hdf5-models';
import {
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  unknownType,
} from '@h5web/shared/hdf5-utils';

import { convertH5GroveDtype } from './utils';

describe('convertH5GroveDtype', () => {
  it('should convert integer dtypes', () => {
    expect(convertH5GroveDtype('<i4')).toStrictEqual(
      intType(32, false, Endianness.LE),
    );
    expect(convertH5GroveDtype('>u8')).toStrictEqual(
      intType(64, true, Endianness.BE),
    );
  });

  it('should convert float dtypes', () => {
    expect(convertH5GroveDtype('<f4')).toStrictEqual(
      floatType(32, Endianness.LE),
    );
    expect(convertH5GroveDtype('>f8')).toStrictEqual(
      floatType(64, Endianness.BE),
    );
  });

  it('should convert complex dtypes', () => {
    expect(convertH5GroveDtype('<c8')).toStrictEqual(
      cplxType(floatType(32, Endianness.LE), floatType(32, Endianness.LE)),
    );
  });

  it('should convert bytes string dtypes', () => {
    expect(convertH5GroveDtype('|S6')).toStrictEqual(strType('ASCII', 6));
  });

  it('should interpret objects as strings', () => {
    expect(convertH5GroveDtype('|O')).toStrictEqual(strType('UTF-8'));
  });

  it('should interpret |b1 as booleans', () => {
    expect(convertH5GroveDtype('|b1')).toStrictEqual(boolType());
  });

  it('should handle "not applicable" endianness symbol', () => {
    expect(convertH5GroveDtype('|f8')).toStrictEqual(floatType(64));
  });

  it('should convert compound dtype', () => {
    expect(
      convertH5GroveDtype({ country: '|S10', population: '<i4' }),
    ).toStrictEqual(
      compoundType({
        country: strType('ASCII', 10),
        population: intType(32, false, Endianness.LE),
      }),
    );
  });

  it('should handle unknown type', () => {
    expect(convertH5GroveDtype('>notAType')).toStrictEqual(unknownType());
  });
});
