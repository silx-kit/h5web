import { combine } from 'zustand/middleware';
import type { ColorMap } from './models';
import { Domain, ScaleType } from '../shared/models';
import { StorageConfig, createPersistableState } from '../../storage-utils';

type HeatmapConfig = {
  dataDomain: Domain | undefined;
  requestedDomain: Domain | undefined;
  colorMap: ColorMap;
  scaleType: ScaleType;
  keepAspectRatio: boolean;
  showGrid: boolean;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:heatmap',
  itemsToPersist: ['colorMap', 'scaleType', 'keepAspectRatio', 'showGrid'],
};

const INITIAL_STATE: HeatmapConfig = {
  dataDomain: undefined,
  requestedDomain: undefined,
  colorMap: 'Viridis',
  scaleType: ScaleType.Linear,
  keepAspectRatio: true,
  showGrid: false,
};

export const useHeatmapConfig = createPersistableState(
  STORAGE_CONFIG,
  combine(INITIAL_STATE, (set) => ({
    resetDomains: (dataDomain: Domain | undefined) =>
      set({ dataDomain, requestedDomain: undefined }),

    setRequestedDomain: (requestedDomain: Domain | undefined) =>
      set({ requestedDomain }),

    setColorMap: (colorMap: ColorMap) => set({ colorMap }),

    setScaleType: (scaleType: ScaleType) => set({ scaleType }),

    toggleAspectRatio: () =>
      set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  }))
);
