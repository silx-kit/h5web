import {
  arrayShape,
  arrayType,
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  scalarShape,
  strType,
} from '@h5web/shared/hdf5-utils';
import { dataset } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { formatBytes, getDTypeSize, getValueSize } from './utils';

describe('getDTypeSize', () => {
  it('should return size of type in bytes', () => {
    expect(getDTypeSize(floatType(64))).toBe(8);
    expect(getDTypeSize(intType(false, 16))).toBe(2);
    expect(getDTypeSize(boolType(intType(true, 8)))).toBe(1);
    expect(getDTypeSize(cplxType(floatType()))).toBe(8);
    expect(getDTypeSize(arrayType(floatType(), [2, 3]))).toBe(24);
    expect(getDTypeSize(strType(undefined, undefined, 10))).toBe(10);
    expect(
      getDTypeSize(
        compoundType([
          ['a', intType()],
          ['b', floatType(64)],
        ]),
      ),
    ).toBe(12);
  });

  it('should return `undefined` if size of type is unknown or zero', () => {
    expect(getDTypeSize(strType())).toBeUndefined();
    expect(getDTypeSize(strType(undefined, undefined, 0))).toBeUndefined();
    expect(getDTypeSize(compoundType([]))).toBeUndefined();
    expect(getDTypeSize(arrayType(floatType(), [0]))).toBeUndefined();
    expect(getDTypeSize(cplxType(floatType(0)))).toBeUndefined();
    expect(
      getDTypeSize(
        compoundType([
          ['a', intType()],
          ['b', strType()],
        ]),
      ),
    ).toBeUndefined();
  });
});

describe('getValueSize', () => {
  const twoD = dataset('twoD', arrayShape([1000, 3000]), floatType());

  it('should return size of whole dataset', () => {
    expect(getValueSize(twoD)).toBe(12e6);
  });

  it('should return size of slice', () => {
    expect(getValueSize(twoD, '0,:')).toBe(12e3);
    expect(getValueSize(twoD, ':,10')).toBe(4e3);
    expect(getValueSize(twoD, '0')).toBe(12e3); // trailing dims selected in full
  });

  it('should return size of ranges', () => {
    expect(getValueSize(twoD, '0:100,:')).toBe(1.2e6);
    expect(getValueSize(twoD, ':500,10:')).toBe(5.98e6);
    expect(getValueSize(twoD, '0:1000:10,0')).toBe(400);
    expect(getValueSize(twoD, '::3,0')).toBe(1336);
    expect(getValueSize(twoD, '900:5000,0')).toBe(400); // clamped
    expect(getValueSize(twoD, '50:10,0')).toBe(0);
  });

  it('should assume whole dimension is selected for unsupported formats', () => {
    expect(getValueSize(twoD, '-1,:')).toBe(12e6);
    expect(getValueSize(twoD, 'foo,0')).toBe(4e3);
  });

  it('should fall back to default element size for zero-size type', () => {
    const empty = dataset('empty', arrayShape([10]), compoundType([]));
    expect(getValueSize(empty)).toBe(80);
  });

  it('should handle scalar dataset and type of unknown size', () => {
    expect(getValueSize(dataset('s', scalarShape(), intType()))).toBe(4);
    expect(getValueSize(dataset('str', arrayShape([10]), strType()))).toBe(80);
  });
});

describe('formatBytes', () => {
  it('should format size in gigabytes', () => {
    expect(formatBytes(2e9)).toBe('2 GB');
    expect(formatBytes(11_680_200_000)).toBe('11.7 GB');
  });
});
