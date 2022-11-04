import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  NumArrayDataset,
  ProvidedEntity,
  ScalarShape,
  Value,
} from '@h5web/shared';
import { hasNumericType } from '@h5web/shared';
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
import type { ExportFormat, ExportURL, ValuesStoreParams } from '../models';
import { sliceValue } from '../utils';

const SLOW_TIMEOUT = 3000;

export class MockApi extends DataProviderApi {
  public constructor(
    private readonly _getExportURL?: DataProviderApi['getExportURL']
  ) {
    super(mockFilepath);
  }

  public async getEntity(path: string): Promise<ProvidedEntity> {
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

  public getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>
  ): ExportURL {
    const url = this._getExportURL?.(format, dataset, selection, value);
    if (url) {
      return url;
    }

    if (
      hasNumericType(dataset) &&
      selection === undefined &&
      format === 'csv'
    ) {
      return async () => {
        let csv = '';
        (value as Value<NumArrayDataset>).forEach((val) => {
          csv += `${val.toString()}\n`;
        });

        const finalCsv = csv.slice(0, -2);

        // Demonstrate both `Blob` and `URL` techniques (cf. `src/providers/api.ts`)
        return dataset.name === 'oneD'
          ? new Blob([finalCsv])
          : new URL(`data:text/plain,${encodeURIComponent(finalCsv)}`);
      };
    }

    return undefined;
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
