import type { ColorMap } from './models';
import type { Domain } from '../shared/models';
import { StorageConfig, createPersistableState } from '../../storage-utils';
import { findDomain } from '../shared/utils';

interface HeatmapConfig {
  dataDomain: Domain | undefined;
  initDataDomain: (values: number[]) => void;

  customDomain: Domain | undefined;
  setCustomDomain: (customDomain: Domain | undefined) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  hasLogScale: boolean;
  toggleLogScale: () => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;

  showGrid: boolean;
  toggleGrid: () => void;
}

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:heatmap',
  itemsToPersist: ['colorMap', 'hasLogScale', 'keepAspectRatio', 'showGrid'],
};

export const [useHeatmapConfig] = createPersistableState<HeatmapConfig>(
  STORAGE_CONFIG,
  (set) => ({
    dataDomain: undefined,
    initDataDomain: (values: number[]) => {
      set({
        dataDomain: findDomain(values),
        customDomain: undefined, // reset custom domain
      });
    },

    customDomain: undefined,
    setCustomDomain: (customDomain: Domain | undefined) =>
      set({ customDomain }),

    colorMap: 'Viridis',
    setColorMap: (colorMap: ColorMap) => set({ colorMap }),

    hasLogScale: false,
    toggleLogScale: () => set((state) => ({ hasLogScale: !state.hasLogScale })),

    keepAspectRatio: true,
    toggleAspectRatio: () =>
      set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

    showGrid: false,
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  })
);
