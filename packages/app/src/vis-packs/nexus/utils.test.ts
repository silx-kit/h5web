import { arrayShape, floatType, intType } from '@h5web/shared/hdf5-utils';
import { arrayAttr, dataset, group } from '@h5web/shared/mock-utils';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { type DataContextValue } from '../../providers/DataProvider';
import {
  applyDefaultSlice,
  findAuxErrorDataset,
  findAuxiliaryDatasets,
  guessKeepRatio,
} from './utils';

const axisDataset = dataset('foo', arrayShape([5]), intType());
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

describe('applyDefaultSlice', () => {
  it('should apply slicing indices', () => {
    expect(applyDefaultSlice([0], [5])).toEqual([5]);
    expect(applyDefaultSlice([0, 'x'], [5, '.'])).toEqual([5, 'x']);
    expect(
      applyDefaultSlice([0, 0, 'x', 'y', null], [1, 2, '.', '.', '.']),
    ).toEqual([1, 2, 'x', 'y', null]);
  });

  it('should apply slicing indices and remap dimensions', () => {
    expect(applyDefaultSlice([0, 'x'], ['.', 5])).toEqual(['x', 5]);
    expect(
      applyDefaultSlice([0, 0, 'x', 'y', null], ['.', '.', 1, '.', 2]),
    ).toEqual(['x', 'y', 1, null, 2]);
  });

  it('should have no effect when there are no sliceable dimensions', () => {
    expect(applyDefaultSlice([], [])).toEqual([]);
    expect(applyDefaultSlice(['x'], ['.'])).toEqual(['x']);
    expect(applyDefaultSlice(['x', 'y'], ['.', '.'])).toEqual(['x', 'y']);
    expect(applyDefaultSlice(['x', null, null], ['.', '.', '.'])).toEqual([
      'x',
      null,
      null,
    ]);
  });

  it('should have no effect when default slice is incompatible with mapping', () => {
    expect(applyDefaultSlice(['x'], [5])).toEqual(['x']);
    expect(applyDefaultSlice([0], ['.'])).toEqual([0]);
    expect(applyDefaultSlice([0, 'x'], ['.', '.'])).toEqual([0, 'x']);
    expect(applyDefaultSlice([0, null], [5, 5])).toEqual([0, null]);
    expect(applyDefaultSlice(['x', 'y'], ['.', 5])).toEqual(['x', 'y']);
    expect(applyDefaultSlice(['x', null], ['.', 5])).toEqual(['x', null]);
    expect(applyDefaultSlice([0, 0, 'x'], ['.', 5, '.'])).toEqual([0, 0, 'x']);
  });
});

describe('findAuxiliaryDatasets', () => {
  it('should ignore auxiliary signals with dimensions different from signal', async () => {
    const signal = dataset('signal', arrayShape([2, 3]), floatType());
    const aux = dataset('aux', arrayShape([2, 3]), floatType());
    const auxShort = dataset('aux_short', arrayShape([2]), floatType());
    const auxAttr = arrayAttr('auxiliary_signals', ['aux_short', 'aux']);
    const nxDataGroup = group('nx', [signal, aux, auxShort], {
      attributes: [auxAttr],
    });

    const dataContext = {
      queryClient: new QueryClient(),
      queries: {
        attrValues: () => ({
          queryKey: ['attrValues'],
          queryFn: () => ({ auxiliary_signals: auxAttr.value }),
        }),
      },
    } as unknown as DataContextValue;

    const auxDatasets = await findAuxiliaryDatasets(
      nxDataGroup,
      signal,
      dataContext,
    );
    expect(auxDatasets).toEqual([aux]);
  });
});

describe('findAuxErrorDataset', () => {
  it('should ignore errors with dimensions different from auxiliary signal', () => {
    const aux = dataset('aux', arrayShape([2, 3]), floatType());
    const auxErrors = dataset('aux_errors', arrayShape([2, 3]), floatType());
    const badAuxErrors = dataset('aux_errors', arrayShape([3]), floatType());

    expect(findAuxErrorDataset(group('nx', [aux, auxErrors]), aux)).toBe(
      auxErrors,
    );
    expect(
      findAuxErrorDataset(group('nx', [aux, badAuxErrors]), aux),
    ).toBeUndefined();
  });
});
