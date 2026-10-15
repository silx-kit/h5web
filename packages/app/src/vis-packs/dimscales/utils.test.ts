import { arrayShape, floatType, strType } from '@h5web/shared/hdf5-utils';
import { dataset, group } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { FetcherError } from '../../providers/utils';
import { isTransportError, isUsableScale } from './utils';

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

describe('isTransportError', () => {
  it('should detect failed fetches', () => {
    expect(
      isTransportError(
        new FetcherError(502, 'Bad Gateway', new ArrayBuffer(0)),
      ),
    ).toBe(true);
    expect(isTransportError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isTransportError(new DOMException('', 'TimeoutError'))).toBe(true);

    // Axios network error (i.e. with no response), as rethrown by `createAxiosFetcher`
    const axiosError = Object.assign(new Error('Network Error'), {
      name: 'AxiosError',
    });
    expect(isTransportError(axiosError)).toBe(true);
  });

  it('should not mistake HDF5 errors for transport errors', () => {
    const error = new Error('No entity found at /foo');
    expect(isTransportError(error)).toBe(false);

    // Some providers throw `TypeError` for missing entities, as `fetch` does on network failure
    const typeError = new TypeError('No entity found at /foo');
    expect(isTransportError(typeError)).toBe(false);
  });
});
