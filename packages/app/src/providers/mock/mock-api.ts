import type {
  ArrayShape,
  AttributeValues,
  Entity,
  ScalarShape,
} from '@h5web/shared';
import {
  assertArrayOrTypedArray,
  assertArrayShape,
  assertDefined,
  assertMockAttribute,
  assertMockDataset,
  findMockEntity,
  hasArrayShape,
  isTypedArray,
  mockFilepath,
} from '@h5web/shared';
import type { MockDataset } from '@h5web/shared/src/mock/models';
import axios from 'axios';

import { DataProviderApi } from '../api';
import type { ValuesStoreParams } from '../models';
import { sliceValue } from '../utils';

const SLOW_TIMEOUT = 3000;

export class MockApi extends DataProviderApi {
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
    assertDefined(entity, `No entity found at ${path}`);
    return entity;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    return Object.fromEntries(
      entity.attributes.map((attr) => {
        assertMockAttribute(attr);
        return [attr.name, attr.value];
      })
    );
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;

    if (dataset.name === 'error_value') {
      throw new Error('error');
    }

    if (dataset.name.startsWith('slow')) {
      await this.cancellableDelay(params);
    }

    assertMockDataset(dataset);
    const { value: rawValue } = dataset;
    const value = this.processRawValue(dataset, rawValue);

    if (!selection) {
      return value;
    }

    assertArrayShape(dataset);

    return sliceValue(value, dataset, selection);
  }

  private async cancellableDelay(storeParams: ValuesStoreParams) {
    const cancelSource = axios.CancelToken.source();
    const request = { storeParams, cancelSource };
    this.valueRequests.add(request);

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), SLOW_TIMEOUT);

        void cancelSource.token.promise.then((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } finally {
      this.valueRequests.delete(request);
    }
  }

  private processRawValue(
    dataset: MockDataset<ArrayShape | ScalarShape>,
    rawValue: unknown
  ) {
    assertDefined(rawValue, 'Expected mock dataset to have value');

    if (!hasArrayShape(dataset)) {
      return rawValue;
    }

    assertArrayOrTypedArray(rawValue);
    return isTypedArray(rawValue)
      ? rawValue
      : rawValue.flat(dataset.shape.length - 1);
  }
}
