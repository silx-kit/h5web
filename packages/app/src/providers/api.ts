/* eslint-disable promise/prefer-await-to-callbacks */
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import type {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type {
  ExportFormat,
  ExportURL,
  ProgressCallback,
  ValuesStoreParams,
} from './models';

export abstract class DataProviderApi {
  protected readonly client: AxiosInstance;
  protected progress = new Map<ValuesStoreParams, number>();

  private readonly progressListeners = new Set<ProgressCallback>();

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

  public addProgressListener(cb: ProgressCallback): void {
    this.progressListeners.add(cb);
    cb([...this.progress.values()]); // notify once
  }

  public removeProgressListener(cb: ProgressCallback): void {
    this.progressListeners.delete(cb);
  }

  protected async cancellableFetchValue(
    endpoint: string,
    storeParams: ValuesStoreParams,
    queryParams: Record<string, string | boolean | undefined>,
    signal?: AbortSignal,
    responseType?: ResponseType,
  ): Promise<AxiosResponse> {
    this.progress.set(storeParams, 0);
    this.notifyProgressChange();

    try {
      return await this.client.get(endpoint, {
        signal,
        params: queryParams,
        responseType,
        onDownloadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total !== undefined && evt.total > 0) {
            this.progress.set(storeParams, evt.loaded / evt.total);
            this.notifyProgressChange();
          }
        },
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
    } finally {
      // Remove progress when request fulfills
      this.progress.delete(storeParams);
      this.notifyProgressChange();
    }
  }

  private notifyProgressChange() {
    this.progressListeners.forEach((cb) => cb([...this.progress.values()]));
  }

  public abstract getEntity(path: string): Promise<ProvidedEntity>;
  public abstract getValue(
    params: ValuesStoreParams,
    signal?: AbortSignal,
  ): Promise<unknown>;
  public abstract getAttrValues(entity: Entity): Promise<AttributeValues>;
}
