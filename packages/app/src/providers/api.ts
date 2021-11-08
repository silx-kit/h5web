import type { AttributeValues, Entity } from '@h5web/shared';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  ResponseType,
} from 'axios';
import axios from 'axios';

import type { ValuesStoreParams } from './models';
import { ProviderError } from './models';

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

  public cancelValueRequests(): void {
    // Cancel every active value request
    this.valueRequests.forEach((request) => {
      request.cancelSource.cancel(ProviderError.Cancelled);

      // Save request so params can later be evicted from the values store (cf. `Provider.tsx`)
      this.cancelledValueRequests.add(request);
    });

    this.valueRequests.clear();
  }

  protected async cancellableFetchValue<T>(
    endpoint: string,
    storeParams: ValuesStoreParams,
    queryParams?: Record<string, string | undefined>,
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
