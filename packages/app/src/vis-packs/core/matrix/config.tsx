import { Notation } from '@h5web/lib';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';

export interface MatrixVisConfig {
  customCellWidth: number | undefined;
  setCustomCellWidth: (val: number | undefined) => void;

  notation: Notation;
  setNotation: (not: Notation) => void;
}

function createMatrixConfigStore() {
  return createStore<MatrixVisConfig>()(
    persist(
      (set): MatrixVisConfig => ({
        customCellWidth: undefined,
        setCustomCellWidth: (customCellWidth) => set({ customCellWidth }),

        notation: Notation.Scientific,
        setNotation: (notation) => set({ notation }),
      }),
      {
        name: 'h5web:matrix',
        version: 4,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<MatrixVisConfig>);

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createMatrixConfigStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useMatrixConfig(): MatrixVisConfig {
  return useStore(useContext(StoreContext));
}
