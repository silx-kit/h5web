import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import { ComplexVisType } from './models';

interface ComplexConfig {
  visType: ComplexVisType;
  setVisType: (visType: ComplexVisType) => void;
}

function createStore() {
  return create<ComplexConfig>(
    persist(
      // https://github.com/pmndrs/zustand/issues/701
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (set, get) => ({
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

const { Provider, useStore } = createContext<ComplexConfig>();
export const useComplexConfig = useStore;

export function ComplexConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
