import { type DimensionMapping, initDimMapping } from '@h5web/lib';
import { type ArrayShape } from '@h5web/shared/hdf5-models';
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
  dims: ArrayShape;
  axesCount: number;
  lockedDimsCount: number;
  mapping: DimensionMapping;
}

function createDimMappingStore() {
  return createStore<DimMappingState>(() => ({
    dims: [],
    axesCount: 0,
    lockedDimsCount: 0,
    mapping: [],
  }));
}

const StoreContext = createContext({} as StoreApi<DimMappingState>);

interface Props {}
export function DimMappingProvider(props: PropsWithChildren<Props>) {
  const { children } = props;

  const [store] = useState(createDimMappingStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useDimMappingState(opts: {
  dims: number[];
  axesCount: number;
  lockedDimsCount?: number;
  defaultSlice?: DefaultSlice;
}): [DimensionMapping, (mapping: DimensionMapping) => void] {
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

  const setMapping = useCallback(
    (newMapping: DimensionMapping) => {
      store.setState({ dims, axesCount, lockedDimsCount, mapping: newMapping });
    },
    [dims, axesCount, lockedDimsCount, store],
  );

  if (
    areSameDims(dims, state.dims) &&
    axesCount === state.axesCount &&
    lockedDimsCount === state.lockedDimsCount
  ) {
    // Previous dimension mapping is still valid, so use it
    return [state.mapping, setMapping];
  }

  // Return new mapping
  return [mapping, setMapping];
}
