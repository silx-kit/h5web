import { Notation } from '@h5web/lib';
import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
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

function createStore() {
  return create<MatrixVisConfig>()(
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
      }
    )
  );
}

const { Provider, useStore } = createContext<StoreApi<MatrixVisConfig>>();
export { useStore as useMatrixConfig };

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
