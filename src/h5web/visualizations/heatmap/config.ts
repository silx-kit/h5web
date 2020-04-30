import create from 'zustand';
import { extent } from 'd3-array';
import { ColorMap, Domain } from './models';

export interface HeatmapConfig {
  dataDomain: Domain | undefined;
  initDataDomain: (values: number[]) => void;

  customDomain: Domain | undefined;
  setCustomDomain: (customDomain: Domain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  hasLogScale: boolean;
  toggleLogScale: () => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;
}

export const [useHeatmapConfig] = create<HeatmapConfig>(set => ({
  dataDomain: undefined,
  initDataDomain: (values: number[]) => {
    const [min, max] = extent(values);

    if (min === undefined || max === undefined) {
      set({ dataDomain: undefined, customDomain: undefined });
      return;
    }

    set({
      dataDomain: [min, max],
      customDomain: undefined, // reset custom domain
    });
  },

  customDomain: undefined,
  setCustomDomain: (customDomain: Domain) => set({ customDomain }),

  colorMap: 'Magma',
  setColorMap: (colorMap: ColorMap) => set({ colorMap }),

  hasLogScale: false,
  toggleLogScale: () => set(state => ({ hasLogScale: !state.hasLogScale })),

  keepAspectRatio: true,
  toggleAspectRatio: () =>
    set(state => ({ keepAspectRatio: !state.keepAspectRatio })),
}));
