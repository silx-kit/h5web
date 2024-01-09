import {
  assertArrayShape,
  assertDefined,
  hasNumericType,
  isGroup,
} from '@h5web/shared/guards';
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  GroupWithChildren,
  NumArrayDataset,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import {
  assertMockAttribute,
  assertMockDataset,
} from '@h5web/shared/mock/utils';
import axios from 'axios';

import { DataProviderApi } from '../api';
import type { ExportFormat, ExportURL, ValuesStoreParams } from '../models';
import { sliceValue } from '../utils';
import { makeMockFile } from './mock-file';
import { findMockEntity } from './utils';

export const SLOW_TIMEOUT = 3000;

export class MockApi extends DataProviderApi {
  private readonly mockFile: GroupWithChildren;

  public constructor(
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    const mockFile = makeMockFile();
    super(mockFile.name);
    this.mockFile = mockFile;
  }

  public async getEntity(path: string): Promise<ProvidedEntity> {
    if (path.includes('slow_metadata')) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), SLOW_TIMEOUT);
      });
    }

    const entity = findMockEntity(this.mockFile, path);
    assertDefined(entity, `No entity found at ${path}`);
    return entity;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    return Object.fromEntries(
      entity.attributes.map((attr) => {
        assertMockAttribute(attr);
        return [attr.name, attr.value];
      }),
    );
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;
    assertMockDataset(dataset);

    if (dataset.name === 'raw_large') {
      return { str: '.'.repeat(1_000_000) };
    }

    if (dataset.name === 'error_value') {
      throw new Error('error');
    }

    if (dataset.name.startsWith('slow')) {
      await this.cancellableDelay(params);
    }

    const { value } = dataset;
    assertDefined(value, 'Expected mock dataset to have value');

    if (!selection) {
      return value;
    }

    assertArrayShape(dataset);
    return sliceValue(value, dataset, selection);
  }

  public override getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL {
    const url = this._getExportURL?.(format, dataset, selection, value);
    if (url) {
      return url;
    }

    if (format === 'json') {
      return async () => {
        const json = JSON.stringify(value, null, 2);
        return new Blob([json]);
      };
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

  public override async getSearchablePaths(path: string): Promise<string[]> {
    return this.getEntityPaths(path);
  }

  private getEntityPaths(entityPath: string): string[] {
    const entity = findMockEntity(this.mockFile, entityPath);
    if (!entity) {
      return [];
    }

    if (!isGroup(entity)) {
      return [entity.path];
    }

    return entity.children.reduce<string[]>(
      (acc, child) => [...acc, ...this.getEntityPaths(child.path)],
      [entity.path],
    );
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
}
