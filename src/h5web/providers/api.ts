import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';
import { Entity, ProviderError, ValueRequestParams } from './models';

interface ValueRequest {
  params: ValueRequestParams;
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
    params: ValueRequestParams
  ): Promise<AxiosResponse<T>> {
    const cancelSource = axios.CancelToken.source();
    const request = { params, cancelSource };
    this.valueRequests.add(request);

    try {
      const { token: cancelToken } = cancelSource;
      return await this.client.get<T>(endpoint, { cancelToken });
    } finally {
      // Remove cancellation source when request fulfills
      this.valueRequests.delete(request);
    }
  }

  public abstract getEntity(path: string): Promise<Entity>;
  public abstract getValue(params: ValueRequestParams): Promise<unknown>;
}
