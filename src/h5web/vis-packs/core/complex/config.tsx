import create from 'zustand';
import { persist } from 'zustand/middleware';
import { useState } from 'react';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';
import { ComplexVisType } from './models';

interface ComplexConfig {
  visType: ComplexVisType;
  setVisType: (visType: ComplexVisType) => void;
}

function initialiseStore() {
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

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function ComplexConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [store] = useState(() => initialiseStore());

  return <Provider initialStore={store}>{children}</Provider>;
}
