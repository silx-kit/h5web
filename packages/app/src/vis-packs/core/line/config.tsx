import type { CustomDomain } from '@h5web/lib';
import { CurveType } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import type { AxisScaleType } from '@h5web/shared/vis-models';
import { ScaleType } from '@h5web/shared/vis-models';
import { useMap } from '@react-hookz/web';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface LineConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: AxisScaleType;
  yScaleType: AxisScaleType;
  setXScaleType: (type: AxisScaleType) => void;
  setYScaleType: (type: AxisScaleType) => void;

  showErrors: boolean;
  toggleErrors: () => void;
}

function createLineConfigStore() {
  return createStore<LineConfig>()(
    persist(
      (set): LineConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

        curveType: CurveType.LineOnly,
        setCurveType: (type: CurveType) => set({ curveType: type }),

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (type) => set({ xScaleType: type }),
        setYScaleType: (type) => set({ yScaleType: type }),

        showErrors: true,
        toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
      }),
      {
        name: 'h5web:line',
        version: 5,
      },
    ),
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
  > = {},
): LineConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const {
    setXScaleType: setPersistedXScaleType,
    setYScaleType: setPersistedYScaleType,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setXScaleType: (xScaleType: AxisScaleType) => {
      setPersistedXScaleType(xScaleType);
      suggestedOpts.delete('xScaleType');
    },
    setYScaleType: (yScaleType: AxisScaleType) => {
      setPersistedYScaleType(yScaleType);
      suggestedOpts.delete('yScaleType');
    },
  };
}
