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
import axios, { type AxiosRequestConfig } from 'axios';

import { DataProviderApi } from '../api';
import { type Fetcher, type ValuesStoreParams } from '../models';
import { createAxiosFetcher, FetcherError, toJSON } from '../utils';
import {
  type H5GroveAttrValuesResponse,
  type H5GroveDataResponse,
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
  private readonly fetcher: Fetcher;

  /* API compatible with h5grove@2.3.0 */
  public constructor(
    private readonly baseURL: string,
    filepath: string,
    private readonly axiosConfig?: AxiosRequestConfig,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);

    this.fetcher = createAxiosFetcher(
      axios.create({
        adapter: 'fetch',
        baseURL,
        ...axiosConfig,
      }),
    );
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    const response = await this.fetchEntity(path);
    return parseEntity(path, response);
  }

  public override async getValue(
    params: ValuesStoreParams,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<H5GroveDataResponse> {
    const { dataset } = params;

    if (dataset.type.class === DTypeClass.Opaque) {
      return new Uint8Array(
        await this.fetchBinaryData(params, abortSignal, onProgress),
      );
    }

    const DTypedArray = h5groveTypedArrayFromDType(dataset.type);
    if (DTypedArray) {
      const buffer = await this.fetchBinaryData(
        params,
        abortSignal,
        onProgress,
        true,
      );
      const array = new DTypedArray(buffer);
      return hasScalarShape(dataset) ? array[0] : array;
    }

    return await this.fetchData(params, abortSignal, onProgress);
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    const { path, attributes } = entity;
    return attributes.length > 0 ? this.fetchAttrValues(path) : {};
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
      ...(this.axiosConfig?.params as Record<string, string>),
      path: dataset.path,
      format,
      ...(selection && { selection }),
    });

    return new URL(`${this.baseURL || ''}/data/?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    const buffer = await this.fetcher(`/paths/`, { path });
    return toJSON(buffer) as H5GrovePathsResponse;
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    try {
      const buffer = await this.fetcher(`/meta/`, { path });
      return toJSON(buffer) as H5GroveEntityResponse;
    } catch (error) {
      if (!(error instanceof FetcherError)) {
        throw error;
      }

      const payload = toJSON(error.buffer);
      if (!isH5GroveErrorResponse(payload)) {
        throw error;
      }

      const { message } = payload;
      if (message.includes('File not found')) {
        throw new Error(`File not found: '${this.filepath}'`, { cause: error });
      }
      if (message.includes('Permission denied')) {
        throw new Error(
          `Cannot read file '${this.filepath}': Permission denied`,
          { cause: error },
        );
      }
      if (message.includes('not a valid path')) {
        throw new Error(`No entity found at ${path}`, { cause: error });
      }
      if (message.includes('Cannot resolve')) {
        throw new Error(`Could not resolve soft link at ${path}`, {
          cause: error,
        });
      }

      throw error;
    }
  }

  private async fetchAttrValues(
    path: string,
  ): Promise<H5GroveAttrValuesResponse> {
    const buffer = await this.fetcher(`/attr/`, { path });
    return toJSON(buffer) as H5GroveAttrValuesResponse;
  }

  private async fetchData(
    params: ValuesStoreParams,
    abortSignal: AbortSignal | undefined,
    onProgress: OnProgress | undefined,
  ): Promise<H5GroveDataResponse> {
    const { dataset, selection } = params;

    const buffer = await this.fetcher(
      '/data/',
      {
        path: dataset.path,
        ...(selection && { selection }),
        flatten: 'true',
      },
      { abortSignal, onProgress },
    );

    return toJSON(buffer);
  }

  private async fetchBinaryData(
    params: ValuesStoreParams,
    abortSignal: AbortSignal | undefined,
    onProgress: OnProgress | undefined,
    safe = false,
  ): Promise<ArrayBuffer> {
    const { dataset, selection } = params;

    return this.fetcher(
      '/data/',
      {
        path: dataset.path,
        ...(selection && { selection }),
        format: 'bin',
        ...(safe && { dtype: 'safe' }),
      },
      { abortSignal, onProgress },
    );
  }
}
