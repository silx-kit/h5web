import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

interface MatrixVisConfig {
  sticky: boolean;
  toggleSticky: () => void;
}

function createStore() {
  return create<MatrixVisConfig>(
    persist(
      (set) => ({
        sticky: false,
        toggleSticky: () => set((state) => ({ sticky: !state.sticky })),
      }),
      {
        name: 'h5web:matrix',
        version: 1,
      }
    )
  );
}

const { Provider, useStore } = createContext<MatrixVisConfig>();
export const useMatrixVisConfig = useStore;

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
