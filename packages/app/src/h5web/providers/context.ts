import { createContext } from 'react';
import type { ValuesStoreParams } from './models';
import type { FetchStore } from 'react-suspense-fetch';
import type { Entity } from '@h5web/shared';

interface ValuesStore extends FetchStore<unknown, ValuesStoreParams> {
  cancelOngoing: () => void;
  evictCancelled: () => void;
}

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ValuesStore;
}

export const ProviderContext = createContext({} as Context);
