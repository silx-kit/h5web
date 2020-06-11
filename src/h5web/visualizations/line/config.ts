import { StorageConfig, createPersistableState } from '../../storage-utils';
import { CurveType } from './models';
import { ScaleType } from '../shared/models';

type LineConfig = {
  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  scaleType: ScaleType;
  setScaleType: (type: ScaleType) => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['curveType', 'showGrid', 'scaleType'],
};

export const [useLineConfig] = createPersistableState<LineConfig>(
  STORAGE_CONFIG,
  (set) => ({
    curveType: CurveType.LineOnly,
    setCurveType: (type: CurveType) => set({ curveType: type }),

    showGrid: true,
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    scaleType: ScaleType.Linear,
    setScaleType: (type: ScaleType) => set({ scaleType: type }),
  })
);
