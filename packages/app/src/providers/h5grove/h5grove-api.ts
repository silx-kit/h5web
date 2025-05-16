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
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';

import { DataProviderApi } from '../api';
import { type ValuesStoreParams } from '../models';
import { AbortError, createAxiosProgressHandler } from '../utils';
import {
  type H5GroveAttrValuesResponse,
  type H5GroveDataResponse,
  type H5GroveEntityResponse,
  type H5GrovePathsResponse,
} from './models';
import {
  h5groveTypedArrayFromDType,
  isH5GroveError,
  parseEntity,
} from './utils';

const SUPPORTED_EXPORT_FORMATS = new Set<ExportFormat>(['npy', 'tiff']);

export class H5GroveApi extends DataProviderApi {
  private readonly client: AxiosInstance;

  /* API compatible with h5grove@2.3.0 */
  public constructor(
    url: string,
    filepath: string,
    axiosConfig?: AxiosRequestConfig,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);

    this.client = axios.create({
      adapter: 'fetch',
      baseURL: url,
      ...axiosConfig,
    });
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

    try {
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
    } catch (error) {
      if (error instanceof AxiosError && axios.isCancel(error)) {
        throw new AbortError(abortSignal, error);
      }

      throw error;
    }
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

    const { baseURL, params } = this.client.defaults;

    const searchParams = new URLSearchParams(params as Record<string, string>);
    searchParams.set('path', dataset.path);
    searchParams.set('format', format);

    if (selection) {
      searchParams.set('selection', selection);
    }

    return new URL(`${baseURL || ''}/data/?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    const { data } = await this.client.get<H5GrovePathsResponse>(`/paths/`, {
      params: { path },
    });

    return data;
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    try {
      const { data } = await this.client.get<H5GroveEntityResponse>(`/meta/`, {
        params: { path },
      });
      return data;
    } catch (error) {
      if (
        !(error instanceof AxiosError) ||
        !isH5GroveError(error.response?.data)
      ) {
        throw error;
      }

      const { message } = error.response.data;
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
    const { data } = await this.client.get<H5GroveAttrValuesResponse>(
      `/attr/`,
      { params: { path } },
    );
    return data;
  }

  private async fetchData(
    params: ValuesStoreParams,
    abortSignal: AbortSignal | undefined,
    onProgress: OnProgress | undefined,
  ): Promise<H5GroveDataResponse> {
    const { data } = await this.client.get<H5GroveDataResponse>('/data/', {
      params: {
        path: params.dataset.path,
        selection: params.selection,
        flatten: true,
      },
      signal: abortSignal,
      onDownloadProgress: createAxiosProgressHandler(onProgress),
    });
    return data;
  }

  private async fetchBinaryData(
    params: ValuesStoreParams,
    abortSignal: AbortSignal | undefined,
    onProgress: OnProgress | undefined,
    safe = false,
  ): Promise<ArrayBuffer> {
    const { data } = await this.client.get<ArrayBuffer>('/data/', {
      responseType: 'arraybuffer',
      params: {
        path: params.dataset.path,
        selection: params.selection,
        format: 'bin',
        dtype: safe ? 'safe' : undefined,
      },
      signal: abortSignal,
      onDownloadProgress: createAxiosProgressHandler(onProgress),
    });
    return data;
  }
}
