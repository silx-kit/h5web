import { arrayShape, floatType, strType } from '@h5web/shared/hdf5-utils';
import { dataset, group } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { isUsableScale } from './utils';

function scaleOfShape(dims: number[]) {
  return dataset('scale', arrayShape(dims), floatType());
}

describe('isUsableScale', () => {
  it('should accept a 1D numeric dataset matching the dimension', () => {
    expect(isUsableScale(scaleOfShape([10]), 10)).toBe(true);
  });

  it('should reject an entity that could not be resolved', () => {
    expect(isUsableScale(undefined, 10)).toBe(false);
  });

  it('should reject an entity that is not a dataset', () => {
    expect(isUsableScale(group('scale'), 10)).toBe(false);
  });

  it('should reject a non-numeric scale', () => {
    // A string scale is legal HDF5 but cannot be plotted as an axis
    expect(isUsableScale(dataset('s', arrayShape([10]), strType()), 10)).toBe(
      false,
    );
  });

  it('should reject a scale that would misalign the data', () => {
    expect(isUsableScale(scaleOfShape([9]), 10)).toBe(false);
    expect(isUsableScale(scaleOfShape([11]), 10)).toBe(false);
    expect(isUsableScale(scaleOfShape([10, 2]), 10)).toBe(false);
  });
});
