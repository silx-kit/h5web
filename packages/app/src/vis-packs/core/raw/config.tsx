import { type NoProps } from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RawConfig {
  fitImage: boolean;
  setFitImage: (fitImage: boolean) => void;
}

function createRawConfigStore() {
  return createStore<RawConfig>()(
    persist(
      (set): RawConfig => ({
        fitImage: true,
        setFitImage: (fitImage) => set({ fitImage }),
      }),
      {
        name: 'h5web:raw',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<RawConfig>);

export function RawConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createRawConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useRawConfig(): RawConfig {
  return useStore(useContext(StoreContext));
}
