import { type DimensionMapping, initDimMapping } from '@h5web/lib';
import { type NoProps } from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';

import { type DefaultSlice } from './vis-packs/nexus/models';
import { applyDefaultSlice, areSameDims } from './vis-packs/nexus/utils';

interface DimMappingState {
  dims: number[];
  axesCount: number;
  lockedDimsCount: number;
  mapping: DimensionMapping;
  multiDim: number | undefined;
}

function createDimMappingStore() {
  return createStore<DimMappingState>(() => ({
    dims: [],
    axesCount: 0,
    lockedDimsCount: 0,
    mapping: [],
    multiDim: undefined,
  }));
}

const StoreContext = createContext({} as StoreApi<DimMappingState>);

export function DimMappingProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createDimMappingStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useDimMappingState(opts: {
  dims: number[];
  axesCount: number;
  lockedDimsCount?: number;
  defaultSlice?: DefaultSlice;
}): [
  DimensionMapping,
  (mapping: DimensionMapping) => void,
  number | undefined,
  (dim: number | undefined) => void,
] {
  const { dims, axesCount, lockedDimsCount = 0, defaultSlice } = opts;

  const store = useContext(StoreContext);
  const state = useStore(store);

  // Prepare new, memoised mapping and setter
  const mapping = useMemo(() => {
    const newMapping = initDimMapping(dims, axesCount, lockedDimsCount);

    return defaultSlice
      ? applyDefaultSlice(newMapping, defaultSlice)
      : newMapping;
  }, [dims, axesCount, lockedDimsCount, defaultSlice]);

  const isStateValid = useCallback(
    (st: DimMappingState) =>
      areSameDims(dims, st.dims) &&
      axesCount === st.axesCount &&
      lockedDimsCount === st.lockedDimsCount,
    [dims, axesCount, lockedDimsCount],
  );

  // Use previous dimension mapping if it is still valid
  const currentMapping = isStateValid(state) ? state.mapping : mapping;
  const currentMultiDim = isStateValid(state) ? state.multiDim : undefined;

  // Read latest store state, as setters can be called asynchronously (e.g. debounced slicing)
  const setMapping = useCallback(
    (newMapping: DimensionMapping) => {
      store.setState((prevState) => {
        const prevMultiDim = isStateValid(prevState)
          ? prevState.multiDim
          : undefined;

        return {
          dims,
          axesCount,
          lockedDimsCount,
          mapping: newMapping,
          // Reset multi-plotting dimension if it is no longer sliceable (e.g. mapped to axis)
          multiDim:
            prevMultiDim !== undefined &&
            typeof newMapping[prevMultiDim] === 'number'
              ? prevMultiDim
              : undefined,
        };
      });
    },
    [dims, axesCount, lockedDimsCount, isStateValid, store],
  );

  const setMultiDim = useCallback(
    (dim: number | undefined) => {
      store.setState((prevState) => ({
        dims,
        axesCount,
        lockedDimsCount,
        mapping: isStateValid(prevState) ? prevState.mapping : mapping,
        multiDim: dim,
      }));
    },
    [dims, axesCount, lockedDimsCount, mapping, isStateValid, store],
  );

  return [currentMapping, setMapping, currentMultiDim, setMultiDim];
}
