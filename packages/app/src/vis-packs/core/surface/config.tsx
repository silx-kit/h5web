import { type CustomDomain } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import {
  type ColorScaleType,
  type NoProps,
  ScaleType,
} from '@h5web/shared/vis-models';
import { useMap } from '@react-hookz/web';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ColorMap } from '../heatmap/models';

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
  initialSuggestedOpts: Partial<Pick<SurfaceConfig, 'scaleType'>> = {},
): SurfaceConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
  );

  const config = useStore(useContext(StoreContext));

  return {
    ...config,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ColorScaleType) => {
      config.setScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
  };
}
