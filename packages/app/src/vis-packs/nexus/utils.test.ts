import { intType } from '@h5web/shared/hdf5-utils';
import { dataset } from '@h5web/shared/mock-utils';

import { guessKeepRatio } from './utils';

const axisDataset = dataset('foo', intType(), [5]);
const axisDefNoUnit = { label: 'foo', unit: undefined, dataset: axisDataset };
const axisDefUnitX = { label: 'foo', unit: 'mm', dataset: axisDataset };
const axisDefUnitY = { label: 'foo', unit: 'degrees', dataset: axisDataset };

describe('guessKeepRatio', () => {
  it('should return `cover` if units of both axes are provided and equal', () => {
    expect(guessKeepRatio(axisDefUnitX, axisDefUnitX)).toBe(true);
  });

  it('should return `fill` if units of both axes are provided but different', () => {
    expect(guessKeepRatio(axisDefUnitX, axisDefUnitY)).toBe(false);
  });

  it('should return `fill` if unit is provided for only one axis', () => {
    expect(guessKeepRatio(axisDefUnitX, undefined)).toBe(false);
    expect(guessKeepRatio(undefined, axisDefUnitY)).toBe(false);
  });

  it('should return `undefined` if both axis defs/units are undefined', () => {
    expect(guessKeepRatio(undefined, undefined)).toBeUndefined();
    expect(guessKeepRatio(axisDefNoUnit, undefined)).toBeUndefined();
    expect(guessKeepRatio(undefined, axisDefNoUnit)).toBeUndefined();
    expect(guessKeepRatio(axisDefNoUnit, axisDefNoUnit)).toBeUndefined();
  });
});
