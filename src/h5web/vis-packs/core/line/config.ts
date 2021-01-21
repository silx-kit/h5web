import { combine } from 'zustand/middleware';
import { StorageConfig, createPersistableState } from '../../../storage-utils';
import { CurveType } from './models';
import { ScaleType } from '../models';

interface LineConfig {
  curveType: CurveType;
  showGrid: boolean;
  xScaleType: ScaleType;
  yScaleType: ScaleType;
  autoScale: boolean;
  isAutoScaleDisabled: boolean;
}

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: [
    'curveType',
    'showGrid',
    'xScaleType',
    'yScaleType',
    'autoScale',
  ],
};

const INITIAL_STATE: LineConfig = {
  curveType: CurveType.LineOnly,
  showGrid: true,
  xScaleType: ScaleType.Linear,
  yScaleType: ScaleType.Linear,
  autoScale: false,
  isAutoScaleDisabled: false,
};

export const useLineConfig = createPersistableState(
  STORAGE_CONFIG,
  combine({ ...INITIAL_STATE }, (set) => ({
    setCurveType: (type: CurveType) => set({ curveType: type }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    setXScaleType: (type: ScaleType) => set({ xScaleType: type }),
    setYScaleType: (type: ScaleType) => set({ yScaleType: type }),
    toggleAutoScale: () => set((state) => ({ autoScale: !state.autoScale })),
    disableAutoScale: (isAutoScaleDisabled: boolean) =>
      set({ isAutoScaleDisabled }),
  }))
);
