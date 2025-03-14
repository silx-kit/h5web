import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';

export interface ScalarConfig {
  fitImage: boolean;
  toggleFitImage: () => void;
}

function createScalarConfigStore() {
  return createStore<ScalarConfig>()(
    persist(
      (set): ScalarConfig => ({
        fitImage: true,
        toggleFitImage: () => set((state) => ({ fitImage: !state.fitImage })),
      }),
      {
        name: 'h5web:scalar',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<ScalarConfig>);

export function ScalarConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createScalarConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useScalarConfig(): ScalarConfig {
  return useStore(useContext(StoreContext));
}
