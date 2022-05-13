import type { CustomDomain } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';
import type { ColorMap } from '../heatmap/models';

interface ScatterConfig {
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
      // https://github.com/pmndrs/zustand/issues/701
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (set, get) => ({
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
export { useStore as useScatterConfig };

export function ScatterConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
