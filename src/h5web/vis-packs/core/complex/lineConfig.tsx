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

function initialiseStore(onRehydrated: () => void) {
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
        onRehydrateStorage: () => onRehydrated,
      }
    )
  );
}

const { Provider, useStore } = createContext<ComplexLineConfig>();
export const useComplexLineConfig = useStore;

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function ComplexLineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  // https://github.com/pmndrs/zustand/issues/346
  const [rehydrated, setRehydrated] = useState(false);

  // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [store] = useState(() => {
    return initialiseStore(() => setRehydrated(true));
  });

  return rehydrated ? (
    <Provider initialStore={store}>{children}</Provider>
  ) : null;
}
