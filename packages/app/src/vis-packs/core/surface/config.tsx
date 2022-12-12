import type { CustomDomain } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import { isDefined } from '@h5web/shared';
import { useMap } from '@react-hookz/web';
import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ColorMap } from '../heatmap/models';

export interface SurfaceConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;
}

function createStore() {
  return create<SurfaceConfig>()(
    persist<SurfaceConfig>(
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
        setScaleType: (scaleType: ScaleType) => set({ scaleType }),
      }),
      {
        name: 'h5web:surface',
        version: 1,
      }
    )
  );
}

const { Provider, useStore } = createContext<StoreApi<SurfaceConfig>>();

export function SurfaceConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}

export function useSurfaceConfig(
  initialSuggestedOpts: Partial<Pick<SurfaceConfig, 'scaleType'>> = {}
): SurfaceConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val))
  );

  const persistedConfig = useStore();
  const { setScaleType: setPersistedScaleType } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ScaleType) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
  };
}
