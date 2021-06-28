import { createContext } from 'react';
import type { Entity, ValueRequestParams } from './models';
import type { FetchStore } from 'react-suspense-fetch';

interface ValuesStore extends FetchStore<unknown, ValueRequestParams> {
  cancelOngoing: () => void;
  evictCancelled: () => void;
}

interface Context {
  filename: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ValuesStore;
}

export const ProviderContext = createContext({} as Context);
