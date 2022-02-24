import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

interface MatrixVisConfig {
  sticky: boolean;
  toggleSticky: () => void;

  customCellWidth: number | undefined;
  setCustomCellWidth: (val: number | undefined) => void;
}

function createStore() {
  return create<MatrixVisConfig>(
    persist(
      // https://github.com/pmndrs/zustand/issues/701
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (set, get) => ({
        sticky: false,
        toggleSticky: () => set((state) => ({ sticky: !state.sticky })),

        customCellWidth: undefined,
        setCustomCellWidth: (customCellWidth) => {
          set({ customCellWidth });
        },
      }),
      {
        name: 'h5web:matrix',
        version: 2,
      }
    )
  );
}

const { Provider, useStore } = createContext<MatrixVisConfig>();
export { useStore as useMatrixConfig };

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
