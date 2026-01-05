import { type CustomDomain } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import { type ColorScaleType, ScaleType } from '@h5web/shared/vis-models';
import { useMap } from '@react-hookz/web';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';
import { type ColorMap } from '../heatmap/models';

export interface SurfaceConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;
}

function createSurfaceConfigStore() {
  return createStore<SurfaceConfig>()(
    persist(
      (set): SurfaceConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () =>
          set((state) => ({ invertColorMap: !state.invertColorMap })),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set({ scaleType }),
      }),
      {
        name: 'h5web:surface',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<SurfaceConfig>);

export function SurfaceConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createSurfaceConfigStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useSurfaceConfig(
  initialSuggestedOpts: Partial<Pick<SurfaceConfig, 'scaleType'>> = {},
): SurfaceConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const { setScaleType: setPersistedScaleType } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ColorScaleType) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
  };
}
