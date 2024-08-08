import { hasNumericType, hasScalarShape } from '@h5web/shared/guards';
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import type { OnProgress } from '@h5web/shared/react-suspense-fetch';
import type { AxiosRequestConfig } from 'axios';

import { DataProviderApi } from '../api';
import type { ExportFormat, ExportURL, ValuesStoreParams } from '../models';
import { handleAxiosError } from '../utils';
import type {
  H5GroveAttrValuesResponse,
  H5GroveDataResponse,
  H5GroveEntityResponse,
  H5GrovePathsResponse,
} from './models';
import {
  h5groveTypedArrayFromDType,
  hasErrorMessage,
  parseEntity,
} from './utils';

export class H5GroveApi extends DataProviderApi {
  /* API compatible with h5grove@2.1.0 */
  public constructor(
    url: string,
    filepath: string,
    axiosConfig?: AxiosRequestConfig,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath, { adapter: 'fetch', baseURL: url, ...axiosConfig });
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    const response = await this.fetchEntity(path);
    return parseEntity(path, response);
  }

  public override async getValue(
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<H5GroveDataResponse> {
    const { dataset } = params;

    if (dataset.type.class === DTypeClass.Opaque) {
      return new Uint8Array(
        await this.fetchBinaryData(params, signal, onProgress),
      );
    }

    const DTypedArray = h5groveTypedArrayFromDType(dataset.type);
    if (DTypedArray) {
      const buffer = await this.fetchBinaryData(
        params,
        signal,
        onProgress,
        true,
      );
      const array = new DTypedArray(buffer);
      return hasScalarShape(dataset) ? array[0] : array;
    }

    return this.fetchData(params, signal, onProgress);
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    const { path, attributes } = entity;
    return attributes.length > 0 ? this.fetchAttrValues(path) : {};
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

    if (format !== 'json' && !hasNumericType(dataset)) {
      return undefined;
    }

    const { baseURL, params } = this.client.defaults;

    const searchParams = new URLSearchParams(params as Record<string, string>);
    searchParams.set('path', dataset.path);
    searchParams.set('format', format);

    if (selection) {
      searchParams.set('selection', selection);
    }

    return new URL(`${baseURL as string}/data/?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    const { data } = await this.client.get<H5GrovePathsResponse>(`/paths/`, {
      params: { path },
    });

    return data;
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    const { data } = await handleAxiosError(
      () =>
        this.client.get<H5GroveEntityResponse>(`/meta/`, { params: { path } }),
      (_, errorData) => {
        if (!hasErrorMessage(errorData)) {
          return undefined;
        }
        const { message } = errorData;

        if (message.includes('File not found')) {
          return `File not found: '${this.filepath}'`;
        }
        if (message.includes('Permission denied')) {
          return `Cannot read file '${this.filepath}': Permission denied`;
        }
        if (message.includes('not a valid path')) {
          return `No entity found at ${path}`;
        }
        if (message.includes('Cannot resolve')) {
          return `Could not resolve soft link at ${path}`;
        }

        return undefined;
      },
    );
    return data;
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
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<H5GroveDataResponse> {
    const { data } = await this.cancellableFetchValue(
      `/data/`,
      {
        path: params.dataset.path,
        selection: params.selection,
        flatten: true,
      },
      signal,
      onProgress,
    );

    return data;
  }

  private async fetchBinaryData(
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
    safe = false,
  ): Promise<ArrayBuffer> {
    const { data } = await this.cancellableFetchValue(
      '/data/',
      {
        path: params.dataset.path,
        selection: params.selection,
        format: 'bin',
        dtype: safe ? 'safe' : undefined,
      },
      signal,
      onProgress,
      'arraybuffer',
    );

    return data;
  }
}
