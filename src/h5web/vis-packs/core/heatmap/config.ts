import create, { State } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorMap } from './models';
import { CustomDomain, Domain, ScaleType } from '../models';

interface HeatmapConfig extends State {
  dataDomain: Domain | undefined;
  setDataDomain: (dataDomain: Domain) => void;

  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;

  showGrid: boolean;
  toggleGrid: () => void;
}

export const useHeatmapConfig = create<HeatmapConfig>(
  persist(
    (set) => ({
      dataDomain: undefined,
      setDataDomain: (dataDomain: Domain) => set({ dataDomain }),

      customDomain: [undefined, undefined],
      setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

      colorMap: 'Viridis',
      setColorMap: (colorMap: ColorMap) => set({ colorMap }),

      invertColorMap: false,
      toggleColorMapInversion: () =>
        set((state) => ({ invertColorMap: !state.invertColorMap })),

      scaleType: ScaleType.Linear,
      setScaleType: (scaleType: ScaleType) => set({ scaleType }),

      keepAspectRatio: true,
      toggleAspectRatio: () =>
        set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

      showGrid: false,
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    }),
    {
      name: 'h5web:heatmap',
      whitelist: [
        'colorMap',
        'scaleType',
        'keepAspectRatio',
        'showGrid',
        'invertColorMap',
      ],
      version: 5,
    }
  )
);
