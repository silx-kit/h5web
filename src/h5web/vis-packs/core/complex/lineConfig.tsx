import create from 'zustand';
import { persist } from 'zustand/middleware';
import { useState } from 'react';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';
import { ComplexLineVisType, ComplexVisType } from './models';

interface ComplexLineConfig {
  visType: ComplexLineVisType;
  setVisType: (visType: ComplexLineVisType) => void;
}

function initialiseStore() {
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

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function ComplexLineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [store] = useState(() => initialiseStore());

  return <Provider initialStore={store}>{children}</Provider>;
}
