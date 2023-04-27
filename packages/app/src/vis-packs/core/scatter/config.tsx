import type { CustomDomain } from '@h5web/lib';
import { isDefined, ScaleType } from '@h5web/shared';
import { useMap } from '@react-hookz/web';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ColorMap } from '../heatmap/models';

export interface ScatterConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: Exclude<ScaleType, 'gamma'>;
  setScaleType: (scaleType: Exclude<ScaleType, 'gamma'>) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: Exclude<ScaleType, 'sqrt' | 'gamma'>;
  yScaleType: Exclude<ScaleType, 'sqrt' | 'gamma'>;
  setXScaleType: (type: Exclude<ScaleType, 'sqrt' | 'gamma'>) => void;
  setYScaleType: (type: Exclude<ScaleType, 'sqrt' | 'gamma'>) => void;
}

function createScatterConfigStore() {
  return createStore<ScatterConfig>()(
    persist(
      (set) => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap: ColorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () => {
          set((state) => ({ invertColorMap: !state.invertColorMap }));
        },

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => {
          set(() => ({ scaleType }));
        },

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (type) => set({ xScaleType: type }),
        setYScaleType: (type) => set({ yScaleType: type }),
      }),
      {
        name: 'h5web:scatter',
        version: 2,
      }
    )
  );
}

const StoreContext = createContext({} as StoreApi<ScatterConfig>);

export function ScatterConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createScatterConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useScatterConfig(
  initialSuggestedOpts: Partial<
    Pick<ScatterConfig, 'scaleType' | 'xScaleType' | 'yScaleType'>
  > = {}
): ScatterConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val))
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const {
    setScaleType: setPersistedScaleType,
    setXScaleType: setPersistedXScaleType,
    setYScaleType: setPersistedYScaleType,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: Exclude<ScaleType, 'gamma'>) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
    setXScaleType: (xScaleType: Exclude<ScaleType, 'sqrt' | 'gamma'>) => {
      setPersistedXScaleType(xScaleType);
      suggestedOpts.delete('xScaleType');
    },
    setYScaleType: (yScaleType: Exclude<ScaleType, 'sqrt' | 'gamma'>) => {
      setPersistedYScaleType(yScaleType);
      suggestedOpts.delete('yScaleType');
    },
  };
}
