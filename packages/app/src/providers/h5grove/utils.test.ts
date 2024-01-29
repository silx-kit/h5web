import { Endianness } from '@h5web/shared/hdf5-models';
import {
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import { parseDType } from './utils';

describe('parseDType', () => {
  it('should convert integer dtypes', () => {
    expect(parseDType('<i4')).toStrictEqual(intType(32, Endianness.LE));
    expect(parseDType('>u8')).toStrictEqual(uintType(64, Endianness.BE));
  });

  it('should convert float dtypes', () => {
    expect(parseDType('<f4')).toStrictEqual(floatType(32, Endianness.LE));
    expect(parseDType('>f8')).toStrictEqual(floatType(64, Endianness.BE));
  });

  it('should convert complex dtypes', () => {
    expect(parseDType('<c8')).toStrictEqual(
      cplxType(floatType(32, Endianness.LE), floatType(32, Endianness.LE)),
    );
  });

  it('should convert bytes string dtypes', () => {
    expect(parseDType('|S6')).toStrictEqual(strType('ASCII', 6));
  });

  it('should interpret objects as strings', () => {
    expect(parseDType('|O')).toStrictEqual(strType('UTF-8'));
  });

  it('should interpret |b1 as booleans', () => {
    expect(parseDType('|b1')).toStrictEqual(boolType());
  });

  it('should handle "not applicable" endianness symbol', () => {
    expect(parseDType('|f8')).toStrictEqual(floatType(64));
  });

  it('should convert compound dtype', () => {
    expect(parseDType({ country: '|S10', population: '<i4' })).toStrictEqual(
      compoundType({
        country: strType('ASCII', 10),
        population: intType(32, Endianness.LE),
      }),
    );
  });

  it('should handle unknown type', () => {
    expect(parseDType('>notAType')).toStrictEqual(unknownType());
  });
});
