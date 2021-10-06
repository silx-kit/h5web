import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ComplexLineVisType } from './models';
import { ComplexVisType } from './models';

interface ComplexLineConfig {
  visType: ComplexLineVisType;
  setVisType: (visType: ComplexLineVisType) => void;
}

function createStore() {
  return create<ComplexLineConfig>(
    persist(
      (set) => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexLineVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complexLine',
        whitelist: ['visType'],
        version: 1,
      }
    )
  );
}

const { Provider, useStore } = createContext<ComplexLineConfig>();
export const useComplexLineConfig = useStore;

export function ComplexLineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
