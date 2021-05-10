import axios from 'axios';
import ndarray from 'ndarray';
import unpack from 'ndarray-unpack';
import { assertArrayShape, assertPrintableType } from '../../guards';
import { ValueRequestParams, ProviderApi } from '../context';
import type { Entity } from '../models';
import { mockFilepath } from './metadata';
import { assertMockDataset, findMockEntity } from './utils';

const SLOW_TIMEOUT = 3000;

export class MockApi extends ProviderApi {
  public constructor() {
    super(mockFilepath);
  }

  public async getEntity(path: string): Promise<Entity> {
    if (path.includes('slow_metadata')) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), SLOW_TIMEOUT);
      });
    }

    return findMockEntity(path);
  }

  public async getValue(params: ValueRequestParams): Promise<unknown> {
    const { path, selection } = params;

    if (path.includes('error_value')) {
      // Throw error when fetching value with specific path
      throw new Error('error');
    }

    const dataset = findMockEntity(path);
    assertMockDataset(dataset);

    if (path.includes('slow')) {
      await this.cancellableDelay(params);
    }

    const { value } = dataset;
    if (!selection) {
      return value;
    }

    assertArrayShape(dataset);
    assertPrintableType(dataset);

    const dataArray = ndarray(
      (dataset.value as (number | string | boolean)[]).flat(
        dataset.shape.length - 1
      ),
      dataset.shape
    );

    const dataView = dataArray.pick(
      ...selection
        .split(',')
        .map((s) => (s === ':' ? null : Number.parseInt(s, 10)))
    );

    return unpack(dataView);
  }

  private async cancellableDelay(params: ValueRequestParams) {
    const cancelSource = axios.CancelToken.source();
    const request = { params, cancelSource };
    this.valueRequests.add(request);

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), SLOW_TIMEOUT);

        cancelSource.token.promise.then((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } finally {
      this.valueRequests.delete(request);
    }
  }
}
