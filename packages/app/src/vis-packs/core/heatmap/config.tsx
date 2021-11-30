import type { CustomDomain } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ColorMap, Layout } from './models';

interface HeatmapConfig {
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

  layout: Layout;
  setLayout: (layout: Layout) => void;

  flipYAxis: boolean;
  toggleYAxisFlip: () => void;
}

function createStore() {
  return create<HeatmapConfig>(
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

        layout: 'cover',
        setLayout: (layout: Layout) => set({ layout }),

        flipYAxis: false,
        toggleYAxisFlip: () =>
          set((state) => ({ flipYAxis: !state.flipYAxis })),
      }),
      {
        name: 'h5web:heatmap',
        version: 9,
      }
    )
  );
}

const { Provider, useStore } = createContext<HeatmapConfig>();
export const useHeatmapConfig = useStore;

export function HeatmapConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
