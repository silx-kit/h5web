import { type CustomDomain } from '@h5web/lib';
import {
  type AxisScaleType,
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

export interface ScatterConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  setInvertColorMap: (invertColorMap: boolean) => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;

  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;

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
        setInvertColorMap: (invertColorMap) => set({ invertColorMap }),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set(() => ({ scaleType })),

        showGrid: true,
        setShowGrid: (showGrid) => set({ showGrid }),

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

export function ScatterConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createScatterConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useScatterConfig(
  suggestions: Partial<
    Pick<ScatterConfig, 'scaleType' | 'xScaleType' | 'yScaleType'>
  > = {},
): ScatterConfig {
  const config = useStore(useContext(StoreContext));

  const [scaleType, setScaleType] = useSuggestion(
    suggestions.scaleType,
    config.scaleType,
    config.setScaleType,
  );

  const [xScaleType, setXScaleType] = useSuggestion(
    suggestions.xScaleType,
    config.xScaleType,
    config.setXScaleType,
  );

  const [yScaleType, setYScaleType] = useSuggestion(
    suggestions.yScaleType,
    config.yScaleType,
    config.setYScaleType,
  );

  return {
    ...config,
    scaleType,
    xScaleType,
    yScaleType,
    setScaleType,
    setXScaleType,
    setYScaleType,
  };
}
