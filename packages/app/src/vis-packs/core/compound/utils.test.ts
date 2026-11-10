import { cplx } from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import { getBaseArray } from '../utils';
import { getCompoundFieldValues } from './utils';

describe('getCompoundFieldValues', () => {
  it('should flatten array of compound values', () => {
    const value = [
      ['foo', cplx(1, 2)],
      ['bar', cplx(3, 4)],
    ];

    const fieldValues = getCompoundFieldValues(value, false);
    expect(fieldValues).toEqual(['foo', cplx(1, 2), 'bar', cplx(3, 4)]);
    expect(getBaseArray(fieldValues, [2, 2]).get(1, 1)).toEqual(cplx(3, 4));
  });

  it('should not flatten array-like field values of scalar compound value', () => {
    const value = ['foo', cplx(1, 2)];

    const fieldValues = getCompoundFieldValues(value, true);
    expect(fieldValues).toEqual(['foo', cplx(1, 2)]);
    expect(getBaseArray(fieldValues, [1, 2]).get(0, 1)).toEqual(cplx(1, 2));
  });
});
