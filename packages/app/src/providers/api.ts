/* eslint-disable promise/prefer-await-to-callbacks */
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  NumericType,
  ProvidedEntity,
} from '@h5web/shared';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type {
  ExportFormat,
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
    config?: AxiosRequestConfig
  ) {
    this.client = axios.create(config);
  }

  public getExportURL?(
    dataset: Dataset<ArrayShape, NumericType>,
    selection: string | undefined,
    format: ExportFormat
  ): string | undefined; // `undefined` if format is not supported

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

  protected async cancellableFetchValue<T>(
    endpoint: string,
    storeParams: ValuesStoreParams,
    queryParams: Record<string, string | boolean | undefined>,
    responseType?: ResponseType
  ): Promise<AxiosResponse<T>> {
    const cancelSource = axios.CancelToken.source();
    const request = { storeParams, cancelSource };
    this.valueRequests.add(request);

    this.progress.set(storeParams, 0);
    this.notifyProgressChange();

    try {
      const { token: cancelToken } = cancelSource;
      return await this.client.get<T>(endpoint, {
        cancelToken,
        params: queryParams,
        responseType,
        onDownloadProgress: (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
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
