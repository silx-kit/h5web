import { createContext } from 'react';

import type { ProviderApi } from './api';
import type {
  AttrValuesStore,
  EntitiesStore,
  ProgressCallback,
  ValuesStore,
} from './models';

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
  getExportURL?: ProviderApi['getExportURL'];
  addProgressListener: (cb: ProgressCallback) => void;
  removeProgressListener: (cb: ProgressCallback) => void;
}

export const ProviderContext = createContext({} as Context);
