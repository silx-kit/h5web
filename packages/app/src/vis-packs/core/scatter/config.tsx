import { type CustomDomain } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import {
  type AxisScaleType,
  type ColorScaleType,
  ScaleType,
} from '@h5web/shared/vis-models';
import { useMap } from '@react-hookz/web';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';
import { type ColorMap } from '../heatmap/models';

export interface ScatterConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: AxisScaleType;
  yScaleType: AxisScaleType;
  setXScaleType: (type: AxisScaleType) => void;
  setYScaleType: (type: AxisScaleType) => void;
}

function createScatterConfigStore() {
  return createStore<ScatterConfig>()(
    persist(
      (set): ScatterConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () =>
          set((state) => ({ invertColorMap: !state.invertColorMap })),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set(() => ({ scaleType })),

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
      },
    ),
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
  > = {},
): ScatterConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
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
    setScaleType: (scaleType: ColorScaleType) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
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
