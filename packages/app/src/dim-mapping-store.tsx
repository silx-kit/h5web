import { type DimensionMapping, initDimMapping } from '@h5web/lib';
import { type ArrayShape } from '@h5web/shared/hdf5-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';

import { areSameDims } from './vis-packs/nexus/utils';

interface DimMappingState {
  dims: ArrayShape;
  axesCount: number;
  lockedDimsCount: number;
  mapping: DimensionMapping;
  setMapping: (mapping: DimensionMapping) => void;
  reset: (
    dims: ArrayShape,
    axesCount: number,
    lockedDimsCount: number,
    mapping: DimensionMapping,
  ) => void;
}

function createDimMappingStore() {
  return createStore<DimMappingState>((set) => ({
    dims: [],
    axesCount: 0,
    lockedDimsCount: 0,
    mapping: [],
    setMapping: (mapping) => set({ mapping }),
    reset: (dims, axesCount, lockedDimsCount, mapping) => {
      set({ dims, axesCount, lockedDimsCount, mapping });
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
  lockedDimsCount = 0,
): [DimensionMapping, (mapping: DimensionMapping) => void] {
  const state = useStore(useContext(StoreContext));

  /* If current mapping was initialised with different axes count and dimensions,
   * need to compute new mapping and reset state. */
  const isStale =
    axesCount !== state.axesCount ||
    lockedDimsCount !== state.lockedDimsCount ||
    !areSameDims(dims, state.dims);

  const mapping = isStale
    ? initDimMapping(dims, axesCount, lockedDimsCount)
    : state.mapping;

  useEffect(() => {
    state.reset(dims, axesCount, lockedDimsCount, mapping);
  }, [isStale]); // eslint-disable-line react-hooks/exhaustive-deps

  return [mapping, state.setMapping];
}
