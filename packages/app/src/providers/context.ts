import { createContext } from 'react';

import type { AttrValuesStore, EntitiesStore, ValuesStore } from './models';

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
}

export const ProviderContext = createContext({} as Context);
