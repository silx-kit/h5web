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
import { type ValuesStoreParams } from '../models';
import { createBasicFetcher, FetcherError, toJSON } from '../utils';
import {
  type H5GroveAttrValuesResponse,
  type H5GroveEntityResponse,
  type H5GrovePathsResponse,
} from './models';
import { H5GroveError, h5groveTypedArrayFromDType, parseEntity } from './utils';

const SUPPORTED_EXPORT_FORMATS = new Set<ExportFormat>(['npy', 'tiff']);

export class H5GroveApi extends DataProviderApi {
  /* API compatible with h5grove@2.3.0 */
  public constructor(
    filepath: string,
    private readonly baseURL: string,
    private readonly fetcher = createBasicFetcher(),
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    try {
      const data = await this.fetcher(`${this.baseURL}/meta/`, {
        file: this.filepath,
        path,
      });

      return parseEntity(path, toJSON(data) as H5GroveEntityResponse);
    } catch (error) {
      throw this.getH5GroveError(error, path) || error;
    }
  }

  public override async getValue(
    storeParams: ValuesStoreParams,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    const { dataset, selection } = storeParams;
    const { path } = dataset;

    const url = `${this.baseURL}/data/`;
    const opts = { abortSignal, onProgress };
    const baseParams = {
      file: this.filepath,
      path,
      ...(selection && { selection }),
    };

    try {
      if (dataset.type.class === DTypeClass.Opaque) {
        const params = { ...baseParams, format: 'bin' };
        const buffer = await this.fetcher(url, params, opts);

        return new Uint8Array(buffer);
      }

      const DTypedArray = h5groveTypedArrayFromDType(dataset.type);
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
      throw this.getH5GroveError(error, path) || error;
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
      const data = await this.fetcher(`${this.baseURL}/attr/`, {
        file: this.filepath,
        path,
      });

      return toJSON(data) as H5GroveAttrValuesResponse;
    } catch (error) {
      throw this.getH5GroveError(error, path) || error;
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

    return new URL(`${this.baseURL || ''}/data/?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    try {
      const data = await this.fetcher(`${this.baseURL}/paths/`, {
        file: this.filepath,
        path,
      });

      return toJSON(data) as H5GrovePathsResponse;
    } catch (error) {
      throw this.getH5GroveError(error, path) || error;
    }
  }

  private getH5GroveError(
    error: unknown,
    path: string,
  ): H5GroveError | undefined {
    if (!(error instanceof FetcherError)) {
      return undefined;
    }

    const { statusText } = error;
    if (statusText.includes('File not found')) {
      throw new H5GroveError(`File not found: '${this.filepath}'`, error);
    }
    if (statusText.includes('Permission denied')) {
      throw new H5GroveError(
        `Cannot read file '${this.filepath}': Permission denied`,
        error,
      );
    }
    if (statusText.includes('not a valid path')) {
      throw new H5GroveError(`No entity found at ${path}`, error);
    }
    if (statusText.includes('Cannot resolve')) {
      throw new H5GroveError(`Could not resolve soft link at ${path}`, error);
    }

    return undefined;
  }
}
