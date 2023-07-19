import { Notation } from '@h5web/lib';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface MatrixVisConfig {
  sticky: boolean;
  toggleSticky: () => void;

  customCellWidth: number | undefined;
  setCustomCellWidth: (val: number | undefined) => void;

  notation: Notation;
  setNotation: (not: Notation) => void;
}

function createMatrixConfigStore() {
  return createStore<MatrixVisConfig>()(
    persist(
      (set) => ({
        sticky: false,
        toggleSticky: () => set((state) => ({ sticky: !state.sticky })),

        customCellWidth: undefined,
        setCustomCellWidth: (customCellWidth) => {
          set({ customCellWidth });
        },

        notation: Notation.Scientific,
        setNotation: (notation) => {
          set({ notation });
        },
      }),
      {
        name: 'h5web:matrix',
        version: 3,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<MatrixVisConfig>);

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createMatrixConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useMatrixConfig(): MatrixVisConfig {
  return useStore(useContext(StoreContext));
}
