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
  setInvertColorMap: (invertColorMap: boolean) => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;

  complexVisType: ComplexHeatmapVisType;
  setComplexVisType: (complexVisType: ComplexHeatmapVisType) => void;

  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;

  keepRatio: boolean;
  setKeepRatio: (keepRatio: boolean) => void;

  flipXAxis: boolean;
  setFlipXAxis: (flipXAxis: boolean) => void;

  flipYAxis: boolean;
  setFlipYAxis: (flipYAxis: boolean) => void;
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
        setInvertColorMap: (invertColorMap) => set({ invertColorMap }),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set(() => ({ scaleType })),

        complexVisType: ComplexVisType.Amplitude,
        setComplexVisType: (complexVisType) => set(() => ({ complexVisType })),

        showGrid: true,
        setShowGrid: (showGrid) => set({ showGrid }),

        keepRatio: true,
        setKeepRatio: (keepRatio) => set({ keepRatio }),

        flipYAxis: false,
        setFlipYAxis: (flipYAxis) => set({ flipYAxis }),

        flipXAxis: false,
        setFlipXAxis: (flipXAxis) => set({ flipXAxis }),
      }),
      {
        name: 'h5web:heatmap',
        version: 12,
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

  const config = useStore(useContext(StoreContext));

  return {
    ...config,
    ...Object.fromEntries(suggestedOpts.entries()),
    setScaleType: (scaleType: ColorScaleType) => {
      config.setScaleType(scaleType);
      suggestedOpts.delete('scaleType');
    },
    setKeepRatio: (keepRatio: boolean) => {
      config.setKeepRatio(keepRatio);
      suggestedOpts.delete('keepRatio');
    },
  };
}
