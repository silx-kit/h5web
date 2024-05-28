import { ComplexVisType } from '@h5web/shared/vis-models';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface ComplexConfig {
  visType: ComplexVisType;
  setVisType: (visType: ComplexVisType) => void;
}

function createComplexConfigStore() {
  return createStore<ComplexConfig>()(
    persist(
      (set): ComplexConfig => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complex',
        version: 3,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<ComplexConfig>);

export function ComplexConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createComplexConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useComplexConfig(): ComplexConfig {
  return useStore(useContext(StoreContext));
}
