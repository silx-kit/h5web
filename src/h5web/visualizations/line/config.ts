import { combine } from 'zustand/middleware';
import { StorageConfig, createPersistableState } from '../../storage-utils';
import { CurveType } from './models';
import { ScaleType } from '../shared/models';

type LineConfig = {
  curveType: CurveType;
  showGrid: boolean;
  scaleType: ScaleType;
  autoScale: boolean;
  isAutoScaleDisabled: boolean;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['curveType', 'showGrid', 'scaleType', 'autoScale'],
};

const INITIAL_STATE: LineConfig = {
  curveType: CurveType.LineOnly,
  showGrid: true,
  scaleType: ScaleType.Linear,
  autoScale: false,
  isAutoScaleDisabled: false,
};

export const useLineConfig = createPersistableState(
  STORAGE_CONFIG,
  combine(INITIAL_STATE, (set) => ({
    setCurveType: (type: CurveType) => set({ curveType: type }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    setScaleType: (type: ScaleType) => set({ scaleType: type }),
    toggleAutoScale: () => set((state) => ({ autoScale: !state.autoScale })),
    disableAutoScale: (isAutoScaleDisabled: boolean) =>
      set({ isAutoScaleDisabled }),
  }))
);
