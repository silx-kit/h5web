import { arrayShape, floatType, scalarShape } from '@h5web/shared/hdf5-utils';
import { dataset } from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { FetcherError } from '../utils';
import { H5GroveApi } from './h5grove-api';

function createApi(buffer: ArrayBuffer): H5GroveApi {
  return new H5GroveApi('', 'file.h5', async () => buffer);
}

const twoD = dataset('twoD', arrayShape([2, 3]), floatType());
const scalar = dataset('scalar', scalarShape(), floatType());

describe('getValue', () => {
  it('should return typed array of expected length', async () => {
    const api = createApi(new Float32Array([1, 2, 3, 4, 5, 6]).buffer);
    await expect(api.getValue(twoD)).resolves.toHaveLength(6);

    const sliceApi = createApi(new Float32Array([4, 5, 6]).buffer);
    await expect(sliceApi.getValue(twoD, '1,:')).resolves.toHaveLength(3);
  });

  it('should throw if number of received values is unexpected', async () => {
    // e.g. empty or truncated response for dataset too large to be loaded (#1650)
    const api = createApi(new ArrayBuffer(0));
    await expect(api.getValue(twoD)).rejects.toThrow(
      'Expected 6 values instead of 0',
    );
    await expect(api.getValue(twoD, '1,:')).rejects.toThrow(
      'Expected 3 values instead of 0',
    );
    await expect(api.getValue(scalar)).rejects.toThrow(
      'Expected 1 values instead of 0',
    );
  });

  it('should keep fetcher error when error response is not JSON', async () => {
    const error = new FetcherError(502, 'Bad Gateway', new ArrayBuffer(0));
    const api = new H5GroveApi('', 'file.h5', async () => {
      throw error;
    });

    await expect(api.getValue(twoD)).rejects.toBe(error);
  });
});
