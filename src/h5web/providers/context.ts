import { createContext } from 'react';
import { Entity, ProviderError } from './models';
import type { FetchStore } from 'react-suspense-fetch';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  CancelTokenSource,
  AxiosResponse,
} from 'axios';

// https://github.com/microsoft/TypeScript/issues/15300#issuecomment-771916993
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ValueRequestParams = {
  path: string;
  selection?: string;
};

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

interface ValuesStore extends FetchStore<unknown, ValueRequestParams> {
  cancelOngoing: () => void;
  evictCancelled: () => void;
}

interface Context {
  filepath: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ValuesStore;
}

export const ProviderContext = createContext<Context>({} as Context);
