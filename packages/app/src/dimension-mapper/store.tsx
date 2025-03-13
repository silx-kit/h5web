import { type ArrayShape } from '@h5web/shared/hdf5-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';

import { areSameDims } from '../vis-packs/nexus/utils';
import { type DimensionMapping } from './models';

interface DimMappingState {
  dims: ArrayShape;
  axesCount: number;
  mapping: DimensionMapping;
  setMapping: (mapping: DimensionMapping) => void;
  reset: (
    dims: ArrayShape,
    axesCount: number,
    mapping: DimensionMapping,
  ) => void;
}

function createDimMappingStore() {
  return createStore<DimMappingState>((set) => ({
    dims: [],
    axesCount: 0,
    mapping: [],
    setMapping: (mapping) => set({ mapping }),
    reset: (dims, axesCount, mapping) => {
      set({ dims, axesCount, mapping });
    },
  }));
}

const StoreContext = createContext({} as StoreApi<DimMappingState>);

interface Props {}
export function DimMappingProvider(props: PropsWithChildren<Props>) {
  const { children } = props;

  const [store] = useState(createDimMappingStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useDimMappingState(
  dims: number[],
  axesCount: number,
): [DimensionMapping, (mapping: DimensionMapping) => void] {
  const state = useStore(useContext(StoreContext));

  /* If current mapping was initialised with different axes count and dimensions,
   * need to compute new mapping and reset state. */
  const isStale =
    axesCount !== state.axesCount || !areSameDims(dims, state.dims);

  const mapping = isStale
    ? [
        ...Array.from({ length: dims.length - axesCount }, () => 0),
        ...(dims.length > 0 && axesCount > 0
          ? ['y' as const, 'x' as const].slice(-axesCount)
          : []),
      ]
    : state.mapping;

  useEffect(() => {
    state.reset(dims, axesCount, mapping);
  }, [isStale]); // eslint-disable-line react-hooks/exhaustive-deps

  return [mapping, state.setMapping];
}
