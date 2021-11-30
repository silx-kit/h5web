import type { ArrayShape, Dataset, NumericType } from '@h5web/shared';
import { createContext } from 'react';

import type { AttrValuesStore, EntitiesStore, ValuesStore } from './models';

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
  getTiffUrl?: (
    dataset: Dataset<ArrayShape, NumericType>,
    selection: string | undefined
  ) => string | undefined;
}

export const ProviderContext = createContext({} as Context);
