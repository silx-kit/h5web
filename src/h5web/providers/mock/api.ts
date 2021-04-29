import axios from 'axios';
import ndarray from 'ndarray';
import unpack from 'ndarray-unpack';
import { assertArrayShape, assertPrintableType } from '../../guards';
import { GetValueParams, ProviderApi } from '../context';
import type { Entity } from '../models';
import { mockFilepath } from './metadata';
import { assertMockDataset, findMockEntity } from './utils';

const SLOW_TIMEOUT = 3000;
const SLOW_METADATA_PATH = '/resilience/slow_metadata';
const SLOW_VALUE_PATH = '/resilience/slow_value';
const SLOW_SLICING_PATH = '/resilience/slow_slicing';
const ERROR_PATH = '/resilience/error_value';

export class MockApi extends ProviderApi {
  public constructor() {
    super(mockFilepath);
  }

  public async getEntity(path: string): Promise<Entity> {
    if (path === SLOW_METADATA_PATH) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), SLOW_TIMEOUT);
      });
    }

    return findMockEntity(path);
  }

  public async getValue(params: GetValueParams): Promise<unknown> {
    const { path, selection } = params;

    if (path === ERROR_PATH) {
      // Throw error when fetching value with specific path
      throw new Error('error');
    }

    const dataset = findMockEntity(path);
    assertMockDataset(dataset);

    if (path === SLOW_VALUE_PATH || path === SLOW_SLICING_PATH) {
      await this.cancellableDelay();
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

  private async cancellableDelay() {
    const cancelSource = axios.CancelToken.source();
    this.cancelSources.add(cancelSource);

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), SLOW_TIMEOUT);

        cancelSource.token.promise.then((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } finally {
      this.cancelSources.delete(cancelSource);
    }
  }
}
