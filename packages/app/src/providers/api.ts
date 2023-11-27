/* eslint-disable promise/prefer-await-to-callbacks */
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/models-hdf5';
import type {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type {
  ExportFormat,
  ExportURL,
  ProgressCallback,
  ValuesStoreParams,
} from './models';
import { CANCELLED_ERROR_MSG } from './utils';

interface ValueRequest {
  storeParams: ValuesStoreParams;
  cancelSource: CancelTokenSource;
}

export abstract class DataProviderApi {
  public readonly cancelledValueRequests = new Set<ValueRequest>();

  protected readonly client: AxiosInstance;
  protected readonly valueRequests = new Set<ValueRequest>();
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

  public cancelValueRequests(): void {
    // Cancel every active value request
    this.valueRequests.forEach((request) => {
      request.cancelSource.cancel(CANCELLED_ERROR_MSG);

      // Save request so params can later be evicted from the values store (cf. `Provider.tsx`)
      this.cancelledValueRequests.add(request);
    });

    this.valueRequests.clear();
  }

  protected async cancellableFetchValue(
    endpoint: string,
    storeParams: ValuesStoreParams,
    queryParams: Record<string, string | boolean | undefined>,
    responseType?: ResponseType,
  ): Promise<AxiosResponse> {
    const cancelSource = axios.CancelToken.source();
    const request = { storeParams, cancelSource };
    this.valueRequests.add(request);

    this.progress.set(storeParams, 0);
    this.notifyProgressChange();

    try {
      const { token: cancelToken } = cancelSource;
      return await this.client.get(endpoint, {
        cancelToken,
        params: queryParams,
        responseType,
        onDownloadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total !== undefined && evt.total > 0) {
            this.progress.set(storeParams, evt.loaded / evt.total);
            this.notifyProgressChange();
          }
        },
      });
    } finally {
      // Remove cancellation source and progress when request fulfills
      this.valueRequests.delete(request);
      this.progress.delete(storeParams);
      this.notifyProgressChange();
    }
  }

  private notifyProgressChange() {
    this.progressListeners.forEach((cb) => cb([...this.progress.values()]));
  }

  public abstract getEntity(path: string): Promise<ProvidedEntity>;
  public abstract getValue(params: ValuesStoreParams): Promise<unknown>;
  public abstract getAttrValues(entity: Entity): Promise<AttributeValues>;
}
