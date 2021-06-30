import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';
import { ComplexVisType } from './models';

interface ComplexConfig {
  visType: ComplexVisType;
  setVisType: (visType: ComplexVisType) => void;
}

function createStore() {
  return create<ComplexConfig>(
    persist(
      (set) => ({
        visType: ComplexVisType.Amplitude,
        setVisType: (visType: ComplexVisType) => set(() => ({ visType })),
      }),
      {
        name: 'h5web:complex',
        whitelist: ['visType'],
        version: 1,
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
