import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface RawConfig {
  fitImage: boolean;
  toggleFitImage: () => void;
}

function createRawConfigStore() {
  return createStore<RawConfig>()(
    persist(
      (set): RawConfig => ({
        fitImage: true,
        toggleFitImage: () => set((state) => ({ fitImage: !state.fitImage })),
      }),
      {
        name: 'h5web:raw',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<RawConfig>);

export function RawConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createRawConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useRawConfig(): RawConfig {
  return useStore(useContext(StoreContext));
}
