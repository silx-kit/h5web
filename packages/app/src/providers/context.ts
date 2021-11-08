import type { AttributeValues, Entity } from '@h5web/shared';
import { createContext } from 'react';
import type { FetchStore } from 'react-suspense-fetch';

import type { ValuesStoreParams } from './models';

interface ValuesStore extends FetchStore<unknown, ValuesStoreParams> {
  cancelOngoing: () => void;
  evictCancelled: () => void;
}

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ValuesStore;
  attrValuesStore: FetchStore<AttributeValues, Entity>;
}

export const ProviderContext = createContext({} as Context);
