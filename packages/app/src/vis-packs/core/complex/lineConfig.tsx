import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ComplexLineVisType } from './models';
import { ComplexVisType } from './models';

export interface ComplexLineConfig {
  visType: ComplexLineVisType;
  setVisType: (visType: ComplexLineVisType) => void;
}

function createComplexLineConfigStore() {
  return createStore<ComplexLineConfig>()(
    persist(
      (set) => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexLineVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complexLine',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<ComplexLineConfig>);

export function ComplexLineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createComplexLineConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useComplexLineConfig(): ComplexLineConfig {
  return useStore(useContext(StoreContext));
}
