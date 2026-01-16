import { type CustomDomain } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import {
  type ColorScaleType,
  type ComplexHeatmapVisType,
  ComplexVisType,
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

import { type ColorMap } from './models';

export interface HeatmapConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;

  complexVisType: ComplexHeatmapVisType;
  setComplexVisType: (complexVisType: ComplexHeatmapVisType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  keepRatio: boolean;
  toggleKeepRatio: () => void;

  flipXAxis: boolean;
  toggleXAxisFlip: () => void;

  flipYAxis: boolean;
  toggleYAxisFlip: () => void;
}

function createHeatmapConfigStore() {
  return createStore<HeatmapConfig>()(
    persist(
      (set): HeatmapConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () => {
          set((state) => ({ invertColorMap: !state.invertColorMap }));
        },

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set(() => ({ scaleType })),

        complexVisType: ComplexVisType.Amplitude,
        setComplexVisType: (complexVisType) => set(() => ({ complexVisType })),

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        keepRatio: true,
        toggleKeepRatio: () =>
          set((state) => ({ keepRatio: !state.keepRatio })),

        flipYAxis: false,
        toggleYAxisFlip: () =>
          set((state) => ({ flipYAxis: !state.flipYAxis })),

        flipXAxis: false,
        toggleXAxisFlip: () =>
          set((state) => ({ flipXAxis: !state.flipXAxis })),
      }),
      {
        name: 'h5web:heatmap',
        version: 11,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<HeatmapConfig>);

export function HeatmapConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createHeatmapConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useHeatmapConfig(
  initialSuggestedOpts: Partial<
    Pick<HeatmapConfig, 'scaleType' | 'keepRatio'>
  > = {},
): HeatmapConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const {
    setScaleType: setPersistedScaleType,
    toggleKeepRatio: togglePersistedKeepRatio,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ColorScaleType) => {
      setPersistedScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
    toggleKeepRatio: () => {
      togglePersistedKeepRatio();
      suggestedOpts.delete('keepRatio');
    },
  };
}
