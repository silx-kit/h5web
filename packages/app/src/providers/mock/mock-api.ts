import { assertArrayShape, assertDefined } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Entity,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import {
  assertMockAttribute,
  assertMockDataset,
} from '@h5web/shared/mock-utils';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';

import { DataProviderApi } from '../api';
import { type ValuesStoreParams } from '../models';
import { makeMockFile } from './mock-file';
import {
  cancellableDelay,
  findMockEntity,
  getChildrenPaths,
  sliceValue,
  SLOW_TIMEOUT,
} from './utils';

export class MockApi extends DataProviderApi {
  private readonly mockFile: GroupWithChildren;

  public constructor(
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    const mockFile = makeMockFile();

    super(mockFile.name);
    this.mockFile = mockFile;
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    if (path.includes('slow_metadata')) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), SLOW_TIMEOUT);
      });
    }

    const entity = findMockEntity(this.mockFile, path);
    assertDefined(entity, `No entity found at ${path}`);
    return entity;
  }

  public override async getValue(
    params: ValuesStoreParams,
    abortSignal?: AbortSignal,
  ): Promise<unknown> {
    const { dataset, selection } = params;
    assertMockDataset(dataset);

    if (dataset.name === 'raw_large') {
      return { str: '.'.repeat(1_000_000) };
    }

    if (dataset.name === 'error_value') {
      throw new Error('error');
    }

    if (dataset.name.startsWith('slow') && abortSignal) {
      await cancellableDelay(abortSignal);
    }

    const { value } = dataset;
    assertDefined(value, 'Expected mock dataset to have value');

    if (!selection) {
      return value;
    }

    assertArrayShape(dataset);
    return sliceValue(value, dataset, selection);
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    return Object.fromEntries(
      entity.attributes.map((attr) => {
        assertMockAttribute(attr);
        return [attr.name, attr.value];
      }),
    );
  }

  public override getExportURL(
    format: ExportFormat,
    dataset: Dataset<ArrayShape>,
    selection?: string,
    builtInExporter?: BuiltInExporter,
  ): ExportURL | undefined {
    const url = this._getExportURL?.(
      format,
      dataset,
      selection,
      builtInExporter,
    );

    if (url) {
      return url;
    }

    if (!builtInExporter) {
      return undefined;
    }

    return async () => {
      const payload = builtInExporter();

      // Demonstrate both `Blob` and `URL` techniques (cf. `src/providers/api.ts`)
      return dataset.name === 'oneD'
        ? new Blob([payload])
        : new URL(`data:text/plain,${encodeURIComponent(payload)}`);
    };
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    return getChildrenPaths(this.mockFile, path);
  }
}
