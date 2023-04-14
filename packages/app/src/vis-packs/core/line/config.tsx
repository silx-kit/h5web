import { CurveType } from '@h5web/lib';
import { isDefined, ScaleType } from '@h5web/shared';
import { useMap } from '@react-hookz/web';
import { omit } from 'lodash';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';

export interface LineConfig {
  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: ScaleType;
  yScaleType: ScaleType;
  setXScaleType: (type: ScaleType) => void;
  setYScaleType: (type: ScaleType) => void;

  autoScale: boolean;
  toggleAutoScale: () => void;

  showErrors: boolean;
  toggleErrors: () => void;
}

function createLineConfigStore() {
  return createStore<LineConfig>()(
    persist(
      (set) => ({
        curveType: CurveType.LineOnly,
        setCurveType: (type: CurveType) => set({ curveType: type }),

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (type: ScaleType) => set({ xScaleType: type }),
        setYScaleType: (type: ScaleType) => set({ yScaleType: type }),

        autoScale: true,
        toggleAutoScale: () => {
          set((state) => ({ autoScale: !state.autoScale }));
        },

        showErrors: true,
        toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
      }),
      {
        name: 'h5web:line',
        partialize: (state) => omit(state, ['autoScale']),
        version: 4,
      }
    )
  );
}

const StoreContext = createContext({} as StoreApi<LineConfig>);

export function LineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createLineConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useLineConfig(
  initialSuggestedOpts: Partial<
    Pick<LineConfig, 'xScaleType' | 'yScaleType'>
  > = {}
): LineConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val))
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const {
    setXScaleType: setPersistedXScaleType,
    setYScaleType: setPersistedYScaleType,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setXScaleType: (xScaleType: ScaleType) => {
      setPersistedXScaleType(xScaleType);
      suggestedOpts.delete('xScaleType');
    },
    setYScaleType: (yScaleType: ScaleType) => {
      setPersistedYScaleType(yScaleType);
      suggestedOpts.delete('yScaleType');
    },
  };
}
