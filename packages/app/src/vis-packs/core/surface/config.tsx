import { type CustomDomain } from '@h5web/lib';
import {
  type ColorScaleType,
  type NoProps,
  ScaleType,
} from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ColorMap } from '../heatmap/models';
import { useSuggestion } from '../hooks';

export interface SurfaceConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  setInvertColorMap: (invertColorMap: boolean) => void;

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
        setInvertColorMap: (invertColorMap) => set({ invertColorMap }),

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

export function SurfaceConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createSurfaceConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useSurfaceConfig(
  suggestions: Partial<Pick<SurfaceConfig, 'scaleType'>> = {},
): SurfaceConfig {
  const config = useStore(useContext(StoreContext));

  const [scaleType, setScaleType] = useSuggestion(
    suggestions.scaleType,
    config.scaleType,
    config.setScaleType,
  );

  return { ...config, scaleType, setScaleType };
}
