import { intType, makeDataset } from '@h5web/shared/mock/metadata-utils';

import { guessKeepRatio } from './utils';

const dataset = makeDataset('foo', intType, [5]);
const defNoUnit = { label: 'foo', unit: undefined, dataset };
const defUnitX = { label: 'foo', unit: 'mm', dataset };
const defUnitY = { label: 'foo', unit: 'degrees', dataset };

describe('guessKeepRatio', () => {
  it('should return `cover` if units of both axes are provided and equal', () => {
    expect(guessKeepRatio(defUnitX, defUnitX)).toBe(true);
  });

  it('should return `fill` if units of both axes are provided but different', () => {
    expect(guessKeepRatio(defUnitX, defUnitY)).toBe(false);
  });

  it('should return `fill` if unit is provided for only one axis', () => {
    expect(guessKeepRatio(defUnitX, undefined)).toBe(false);
    expect(guessKeepRatio(undefined, defUnitY)).toBe(false);
  });

  it('should return `undefined` if both axis defs/units are undefined', () => {
    expect(guessKeepRatio(undefined, undefined)).toBeUndefined();
    expect(guessKeepRatio(defNoUnit, undefined)).toBeUndefined();
    expect(guessKeepRatio(undefined, defNoUnit)).toBeUndefined();
    expect(guessKeepRatio(defNoUnit, defNoUnit)).toBeUndefined();
  });
});
