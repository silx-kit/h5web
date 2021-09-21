import axios from 'axios';
import ndarray from 'ndarray';
import type { Entity, Primitive } from '@h5web/shared';
import {
  mockFilepath,
  findMockEntity,
  hasArrayShape,
  assertDefined,
  assertArrayShape,
  assertPrintableType,
  assertMockDataset,
} from '@h5web/shared';
import { applyMapping } from '../../vis-packs/core/utils';
import { ProviderApi } from '../api';
import { ProviderError } from '../models';
import type { ValuesStoreParams } from '../models';

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

    const entity = findMockEntity(path);
    assertDefined(entity, ProviderError.NotFound);
    return entity;
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { path, selection } = params;

    if (path.includes('error_value')) {
      // Throw error when fetching value with specific path
      throw new Error('error');
    }

    const dataset = findMockEntity(path);
    assertDefined(dataset, ProviderError.NotFound);
    assertMockDataset(dataset);

    if (path.includes('slow')) {
      await this.cancellableDelay(params);
    }

    const { value: rawValue } = dataset;
    const value = hasArrayShape(dataset)
      ? (rawValue as unknown[]).flat(dataset.shape.length - 1)
      : rawValue;
    if (!selection) {
      return value;
    }

    assertArrayShape(dataset);
    assertPrintableType(dataset);

    const { shape, type } = dataset;
    const dataArray = ndarray(value as Primitive<typeof type>[], shape);
    const mappedArray = applyMapping(
      dataArray,
      selection.split(',').map((s) => (s === ':' ? s : Number.parseInt(s, 10)))
    );

    return mappedArray.data;
  }

  private async cancellableDelay(storeParams: ValuesStoreParams) {
    const cancelSource = axios.CancelToken.source();
    const request = { storeParams, cancelSource };
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
