import { intType, makeDataset } from '@h5web/shared/src/mock/metadata-utils';

import { getBestLayout } from './utils';

const dataset = makeDataset('foo', intType, [5]);
const defNoUnit = { label: 'foo', unit: undefined, dataset };
const defUnitX = { label: 'foo', unit: 'mm', dataset };
const defUnitY = { label: 'foo', unit: 'degrees', dataset };

describe('getBestLayout', () => {
  it('should return `cover` if units of both axes are provided and equal', () => {
    expect(getBestLayout(defUnitX, defUnitX)).toBe('cover');
  });

  it('should return `fill` if units of both axes are provided but different', () => {
    expect(getBestLayout(defUnitX, defUnitY)).toBe('fill');
  });

  it('should return `fill` if unit is provided for only one axis', () => {
    expect(getBestLayout(defUnitX, undefined)).toBe('fill');
    expect(getBestLayout(undefined, defUnitY)).toBe('fill');
  });

  it('should return `undefined` if both axis defs/units are undefined', () => {
    expect(getBestLayout(undefined, undefined)).toBeUndefined();
    expect(getBestLayout(defNoUnit, undefined)).toBeUndefined();
    expect(getBestLayout(undefined, defNoUnit)).toBeUndefined();
    expect(getBestLayout(defNoUnit, defNoUnit)).toBeUndefined();
  });
});
