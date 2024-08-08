import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import type { OnProgress } from '@h5web/shared/react-suspense-fetch';
import type {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type { ExportFormat, ExportURL, ValuesStoreParams } from './models';

export abstract class DataProviderApi {
  protected readonly client: AxiosInstance;

  public constructor(
    public readonly filepath: string,
    config?: AxiosRequestConfig,
  ) {
    this.client = axios.create(config);
  }

  /**
   * Provide an export URL for the given format and dataset/slice.
   * The following return types are supported:
   * - `URL`                  Provider has dedicated endpoint for generating server-side exports
   * - `() => Promise<URL>`   Provider generates single-use export URLs (i.e. signed one-time tokens)
   * - `() => Promise<Blob>`  Export is to be generated client-side
   * - `undefined`            Export scenario is not supported
   */
  public getExportURL?<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL;

  public getSearchablePaths?(path: string): Promise<string[]>;

  protected async cancellableFetchValue(
    endpoint: string,
    queryParams: Record<string, string | boolean | undefined>,
    signal?: AbortSignal,
    onProgress?: OnProgress,
    responseType?: ResponseType,
  ): Promise<AxiosResponse> {
    try {
      return await this.client.get(endpoint, {
        signal,
        params: queryParams,
        responseType,
        onDownloadProgress:
          onProgress &&
          ((evt: AxiosProgressEvent) => {
            if (evt.total !== undefined && evt.total > 0) {
              onProgress(evt.loaded / evt.total);
            }
          }),
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        // Throw abort reason instead of axios `CancelError`
        // https://github.com/axios/axios/issues/5758
        throw new Error(
          typeof signal?.reason === 'string' ? signal.reason : 'cancelled',
        );
      }
      throw error;
    }
  }

  public abstract getEntity(path: string): Promise<ProvidedEntity>;

  public abstract getValue(
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown>;

  public abstract getAttrValues(entity: Entity): Promise<AttributeValues>;
}
