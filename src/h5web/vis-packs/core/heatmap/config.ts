import create, { State } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorMap } from './models';
import { Domain, ScaleType } from '../models';

interface HeatmapConfig extends State {
  dataDomain: Domain | undefined;
  customDomain: Domain | undefined;
  resetDomains: (dataDomain: Domain | undefined) => void;
  setCustomDomain: (customDomain: Domain | undefined) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;

  showGrid: boolean;
  toggleGrid: () => void;

  autoScale: boolean;
  isAutoScaleDisabled: boolean;
  toggleAutoScale: () => void;
  disableAutoScale: (isAutoScaleDisabled: boolean) => void;
}

export const useHeatmapConfig = create<HeatmapConfig>(
  persist(
    (set) => ({
      dataDomain: undefined,
      customDomain: undefined,
      resetDomains: (dataDomain: Domain | undefined) =>
        set({ dataDomain, customDomain: undefined }),
      setCustomDomain: (customDomain: Domain | undefined) =>
        set({ customDomain }),

      colorMap: 'Viridis',
      setColorMap: (colorMap: ColorMap) => set({ colorMap }),

      scaleType: ScaleType.Linear,
      setScaleType: (scaleType: ScaleType) => set({ scaleType }),

      keepAspectRatio: true,
      toggleAspectRatio: () =>
        set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

      showGrid: false,
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

      autoScale: false,
      isAutoScaleDisabled: false,
      toggleAutoScale: () => set((state) => ({ autoScale: !state.autoScale })),
      disableAutoScale: (isAutoScaleDisabled: boolean) =>
        set({ isAutoScaleDisabled }),
    }),
    {
      name: 'h5web:heatmap',
      whitelist: [
        'colorMap',
        'scaleType',
        'keepAspectRatio',
        'showGrid',
        'autoScale',
      ],
      version: 1,
    }
  )
);
