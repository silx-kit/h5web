import type { ComplexLineVisType } from '@h5web/shared/vis-models';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface ComplexLineConfig {
  visType: ComplexLineVisType;
  setVisType: (visType: ComplexLineVisType) => void;
}

function createComplexLineConfigStore() {
  return createStore<ComplexLineConfig>()(
    persist(
      (set): ComplexLineConfig => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexLineVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complexLine',
        version: 2,
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
