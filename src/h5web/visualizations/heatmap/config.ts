import type { ColorMap } from './models';
import { Domain, ScaleType } from '../shared/models';
import { StorageConfig, createPersistableState } from '../../storage-utils';

interface HeatmapConfig {
  dataDomain: Domain | undefined;
  resetDomains: (dataDomain: Domain | undefined) => void;

  requestedDomain: Domain | undefined;
  setRequestedDomain: (requestedDomain: Domain | undefined) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;

  showGrid: boolean;
  toggleGrid: () => void;
}

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:heatmap',
  itemsToPersist: ['colorMap', 'scaleType', 'keepAspectRatio', 'showGrid'],
};

export const [useHeatmapConfig] = createPersistableState<HeatmapConfig>(
  STORAGE_CONFIG,
  (set) => ({
    dataDomain: undefined,
    resetDomains: (dataDomain: Domain | undefined) => {
      set({
        dataDomain,
        requestedDomain: undefined,
      });
    },

    requestedDomain: undefined,
    setRequestedDomain: (requestedDomain: Domain | undefined) =>
      set({ requestedDomain }),

    colorMap: 'Viridis',
    setColorMap: (colorMap: ColorMap) => set({ colorMap }),

    scaleType: ScaleType.Linear,
    setScaleType: (scaleType: ScaleType) => set({ scaleType }),

    keepAspectRatio: true,
    toggleAspectRatio: () =>
      set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

    showGrid: false,
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  })
);
