import {
  hasArrayShape,
  hasNumericType,
  hasScalarShape,
} from '@h5web/shared/guards';
import {
  type AttributeValues,
  type Dataset,
  DTypeClass,
  type Entity,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';

import { DataProviderApi } from '../api';
import { type Fetcher, type ValuesStoreParams } from '../models';
import { createBasicFetcher, FetcherError, toJSON } from '../utils';
import {
  type H5GroveAttrValuesResponse,
  type H5GroveEntityResponse,
  type H5GrovePathsResponse,
} from './models';
import {
  h5groveTypedArrayFromDType,
  isH5GroveErrorResponse,
  parseEntity,
} from './utils';

const SUPPORTED_EXPORT_FORMATS = new Set<ExportFormat>(['npy', 'tiff']);

export class H5GroveApi extends DataProviderApi {
  /* API compatible with h5grove@3.0.0 */
  public constructor(
    private readonly baseURL: string,
    filepath: string,
    private readonly fetcher: Fetcher = createBasicFetcher(),
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/meta`, {
        file: this.filepath,
        path,
      });

      return parseEntity(path, toJSON(buffer) as H5GroveEntityResponse);
    } catch (error) {
      throw this.wrapH5GroveError(error, path) || error;
    }
  }

  public override async getValue(
    storeParams: ValuesStoreParams,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    const { dataset, selection } = storeParams;
    const { path, type } = dataset;

    const url = `${this.baseURL}/data`;
    const opts = { abortSignal, onProgress };
    const baseParams = {
      file: this.filepath,
      path,
      ...(selection && { selection }),
    };

    try {
      if (type.class === DTypeClass.Opaque) {
        const params = { ...baseParams, format: 'bin' };
        const buffer = await this.fetcher(url, params, opts);

        return new Uint8Array(buffer);
      }

      const DTypedArray = h5groveTypedArrayFromDType(type);
      if (DTypedArray) {
        const params = { ...baseParams, format: 'bin', dtype: 'safe' };
        const buffer = await this.fetcher(url, params, opts);

        const array = new DTypedArray(buffer);
        return hasScalarShape(dataset) ? array[0] : array;
      }

      const params = { ...baseParams, flatten: 'true' };
      const buffer = await this.fetcher(url, params, opts);

      return toJSON(buffer);
    } catch (error) {
      throw this.wrapH5GroveError(error, path) || error;
    }
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    const { path, attributes } = entity;

    if (attributes.length === 0) {
      return {};
    }

    try {
      const data = await this.fetcher(`${this.baseURL}/attr`, {
        file: this.filepath,
        path,
      });

      return toJSON(data) as H5GroveAttrValuesResponse;
    } catch (error) {
      throw this.wrapH5GroveError(error, path) || error;
    }
  }

  public override getExportURL(
    format: ExportFormat,
    dataset: Dataset,
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

    if (builtInExporter) {
      return async () => new Blob([builtInExporter()]);
    }

    if (
      !SUPPORTED_EXPORT_FORMATS.has(format) ||
      !hasArrayShape(dataset) ||
      !hasNumericType(dataset)
    ) {
      return undefined;
    }

    const searchParams = new URLSearchParams({
      file: this.filepath,
      path: dataset.path,
      format,
      ...(selection && { selection }),
    });

    return new URL(`${this.baseURL || ''}/data?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/paths`, {
        file: this.filepath,
        path,
      });

      return toJSON(buffer) as H5GrovePathsResponse;
    } catch (error) {
      throw this.wrapH5GroveError(error, path) || error;
    }
  }

  private wrapH5GroveError(error: unknown, path: string): Error | undefined {
    if (!(error instanceof FetcherError)) {
      return undefined;
    }

    const payload = toJSON(error.buffer);
    if (!isH5GroveErrorResponse(payload)) {
      return undefined;
    }

    const { message } = payload;
    if (message.includes('File not found')) {
      return new Error(`File not found: '${this.filepath}'`, { cause: error });
    }
    if (message.includes('Permission denied')) {
      return new Error(
        `Cannot read file '${this.filepath}': Permission denied`,
        { cause: error },
      );
    }
    if (message.includes('not a valid path')) {
      return new Error(`No entity found at ${path}`, { cause: error });
    }
    if (message.includes('Cannot resolve')) {
      return new Error(`Could not resolve soft link at ${path}`, {
        cause: error,
      });
    }

    return new Error(message, { cause: error });
  }
}
