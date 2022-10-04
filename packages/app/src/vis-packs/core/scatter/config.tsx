import type { CustomDomain } from '@h5web/lib';
import { isDefined, ScaleType } from '@h5web/shared';
import { useMap } from '@react-hookz/web';
import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
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

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: ScaleType;
  yScaleType: ScaleType;
  setXScaleType: (type: ScaleType) => void;
  setYScaleType: (type: ScaleType) => void;
}

function createStore() {
  return create<ScatterConfig>()(
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
        setScaleType: (scaleType: ScaleType) => {
          set(() => ({ scaleType }));
        },

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (type: ScaleType) => set({ xScaleType: type }),
        setYScaleType: (type: ScaleType) => set({ yScaleType: type }),
      }),
      {
        name: 'h5web:scatter',
        version: 2,
      }
    )
  );
}

const { Provider, useStore } = createContext<StoreApi<ScatterConfig>>();

export function ScatterConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}

export function useScatterConfig(
  initialSuggestedOpts: Partial<
    Pick<ScatterConfig, 'scaleType' | 'xScaleType' | 'yScaleType'>
  > = {}
): ScatterConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val))
  );

  const persistedConfig = useStore();
  const {
    setScaleType: setPersistedScaleType,
    setXScaleType: setPersistedXScaleType,
    setYScaleType: setPersistedYScaleType,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ScaleType) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
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
