import { createContext } from 'react';

import type { ProviderApi } from './api';
import type { AttrValuesStore, EntitiesStore, ValuesStore } from './models';

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
  getExportURL?: ProviderApi['getExportURL'];
}

export const ProviderContext = createContext({} as Context);
