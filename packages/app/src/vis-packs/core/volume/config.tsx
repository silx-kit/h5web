import { type CustomDomain, VolumeQuality, VolumeRenderMode } from '@h5web/lib';
import { type ColorScaleType, ScaleType } from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ColorMap } from '../heatmap/models';

export interface VolumeConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  setInvertColorMap: (invertColorMap: boolean) => void;

  scaleType: ColorScaleType;
  setScaleType: (scaleType: ColorScaleType) => void;

  mode: VolumeRenderMode;
  setMode: (mode: VolumeRenderMode) => void;

  opacity: number;
  setOpacity: (opacity: number) => void;

  threshold: number;
  setThreshold: (threshold: number) => void;

  quality: VolumeQuality;
  setQuality: (quality: VolumeQuality) => void;
}

function createVolumeConfigStore() {
  return createStore<VolumeConfig>()(
    persist(
      (set): VolumeConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain) => set({ customDomain }),

        colorMap: 'Inferno',
        setColorMap: (colorMap) => set({ colorMap }),

        invertColorMap: false,
        setInvertColorMap: (invertColorMap) => set({ invertColorMap }),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType) => set({ scaleType }),

        mode: VolumeRenderMode.DVR,
        setMode: (mode) => set({ mode }),

        opacity: 0.25,
        setOpacity: (opacity) => set({ opacity }),

        threshold: 0.1,
        setThreshold: (threshold) => set({ threshold }),

        quality: VolumeQuality.Medium,
        setQuality: (quality) => set({ quality }),
      }),
      {
        name: 'h5web:volume',
        version: 1,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<VolumeConfig>);

export function VolumeConfigProvider(props: PropsWithChildren) {
  const { children } = props;

  const [store] = useState(createVolumeConfigStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useVolumeConfig(): VolumeConfig {
  return useStore(useContext(StoreContext));
}
