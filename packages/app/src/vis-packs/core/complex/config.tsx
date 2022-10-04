import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import { ComplexVisType } from './models';

export interface ComplexConfig {
  visType: ComplexVisType;
  setVisType: (visType: ComplexVisType) => void;
}

function createStore() {
  return create<ComplexConfig>()(
    persist(
      (set) => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complex',
        version: 2,
      }
    )
  );
}

const { Provider, useStore } = createContext<StoreApi<ComplexConfig>>();
export { useStore as useComplexConfig };

export function ComplexConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
