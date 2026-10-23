import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScalarConfig {
  fitImage: boolean;
  setFitImage: (fitImage: boolean) => void;
}

function createScalarConfigStore() {
  return createStore<ScalarConfig>()(
    persist(
      (set): ScalarConfig => ({
        fitImage: true,
        setFitImage: (fitImage) => set({ fitImage }),
      }),
      {
        name: 'h5web:scalar',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<ScalarConfig>);

export function ScalarConfigProvider(props: PropsWithChildren) {
  const { children } = props;

  const [store] = useState(createScalarConfigStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useScalarConfig(): ScalarConfig {
  return useStore(useContext(StoreContext));
}
