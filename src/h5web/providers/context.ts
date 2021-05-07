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
export type GetValueParams = {
  path: string;
  selection?: string;
};

export abstract class ProviderApi {
  public readonly filepath: string;
  protected readonly client: AxiosInstance;
  protected readonly cancelSources = new Set<CancelTokenSource>();

  public constructor(filepath: string, config?: AxiosRequestConfig) {
    this.filepath = filepath;
    this.client = axios.create(config);
  }

  public async cancellableGet<R>(endpoint: string): Promise<AxiosResponse<R>> {
    const cancelSource = axios.CancelToken.source();
    this.cancelSources.add(cancelSource);

    try {
      const { token: cancelToken } = cancelSource;
      return await this.client.get<R>(endpoint, { cancelToken });
    } finally {
      this.cancelSources.delete(cancelSource);
    }
  }

  public cancel(): void {
    this.cancelSources.forEach((source) => {
      source.cancel(ProviderError.Cancelled);
    });
    this.cancelSources.clear();
  }

  public abstract getEntity(path: string): Promise<Entity>;
  public abstract getValue(params: GetValueParams): Promise<unknown>;
}

interface Context {
  filepath: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: FetchStore<unknown, GetValueParams>;
  cancel: () => void;
}

export const ProviderContext = createContext<Context>({} as Context);
