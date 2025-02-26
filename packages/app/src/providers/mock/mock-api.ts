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

import { DataProviderApi } from '../api';
import {
  type Exporter,
  type ExportFormat,
  type ExportURL,
  type ValuesStoreParams,
} from '../models';
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
    signal?: AbortSignal,
  ): Promise<unknown> {
    const { dataset, selection } = params;
    assertMockDataset(dataset);

    if (dataset.name === 'raw_large') {
      return { str: '.'.repeat(1_000_000) };
    }

    if (dataset.name === 'error_value') {
      throw new Error('error');
    }

    if (dataset.name.startsWith('slow')) {
      await cancellableDelay(signal);
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
    builtInExporter?: Exporter,
  ): ExportURL {
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
      const csv = builtInExporter();

      // Demonstrate both `Blob` and `URL` techniques (cf. `src/providers/api.ts`)
      return dataset.name === 'oneD'
        ? new Blob([csv])
        : new URL(`data:text/plain,${encodeURIComponent(csv)}`);
    };

    // if (format === 'json') {
    //   return async () => {
    //     const json = JSON.stringify(value, null, 2);
    //     return new Blob([json]);
    //   };
    // }

    // return async () => {
    //   let csv = '';
    //   (value as ArrayValue<NumericType>).forEach((val) => {
    //     csv += `${val.toString()}\n`;
    //   });

    //   const finalCsv = csv.slice(0, -2);

    // };
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    return getChildrenPaths(this.mockFile, path);
  }
}
