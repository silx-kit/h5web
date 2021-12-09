import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  NumericType,
} from '@h5web/shared';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type { ExportFormat, ValuesStoreParams } from './models';
import { CANCELLED_ERROR_MSG } from './utils';

interface ValueRequest {
  storeParams: ValuesStoreParams;
  cancelSource: CancelTokenSource;
}

export abstract class ProviderApi {
  public readonly filepath: string;
  public readonly cancelledValueRequests = new Set<ValueRequest>();

  protected readonly client: AxiosInstance;
  protected readonly valueRequests = new Set<ValueRequest>();

  public constructor(filepath: string, config?: AxiosRequestConfig) {
    this.filepath = filepath;
    this.client = axios.create(config);
  }

  public getExportURL?(
    dataset: Dataset<ArrayShape, NumericType>,
    selection: string | undefined,
    format: ExportFormat
  ): string | undefined; // `undefined` if format is not supported

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
    queryParams?: Record<string, string | boolean | undefined>,
    responseType?: ResponseType
  ): Promise<AxiosResponse<T>> {
    const cancelSource = axios.CancelToken.source();
    const request = { storeParams, cancelSource };
    this.valueRequests.add(request);

    try {
      const { token: cancelToken } = cancelSource;
      return await this.client.get<T>(endpoint, {
        cancelToken,
        params: queryParams || storeParams,
        responseType,
      });
    } finally {
      // Remove cancellation source when request fulfills
      this.valueRequests.delete(request);
    }
  }

  public abstract getEntity(path: string): Promise<Entity>;
  public abstract getValue(params: ValuesStoreParams): Promise<unknown>;
  public abstract getAttrValues(entity: Entity): Promise<AttributeValues>;
}
