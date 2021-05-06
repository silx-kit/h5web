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

function initialiseStore(onRehydrated: () => void) {
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
        onRehydrateStorage: () => onRehydrated,
      }
    )
  );
}

const { Provider, useStore } = createContext<ComplexConfig>();
export const useComplexConfig = useStore;

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function ComplexConfigProvider(props: ConfigProviderProps) {
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
