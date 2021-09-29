import type { Primitive, PrintableType } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import create from 'zustand';
import createContext from 'zustand/context';
import type { ConfigProviderProps } from '../../models';

interface MatrixConfig {
  currentSlice: NdArray<Primitive<PrintableType>[]> | undefined;
  setCurrentSlice: (slice: NdArray<Primitive<PrintableType>[]>) => void;
}

function createStore() {
  return create<MatrixConfig>((set) => ({
    currentSlice: undefined,
    setCurrentSlice: (slice) => set({ currentSlice: slice }),
  }));
}

const { Provider, useStore } = createContext<MatrixConfig>();
export const useMatrixConfig = useStore;

export function MatrixConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
