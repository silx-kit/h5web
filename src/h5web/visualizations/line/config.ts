import { StorageConfig, createPersistableState } from '../../storage-utils';
import { CurveType } from './models';

type LineConfig = {
  curveType: CurveType;
  setCurveType: (type: CurveType) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  hasYLogScale: boolean;
  toggleYLogScale: () => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['curveType', 'showGrid', 'hasYLogScale'],
};

export const [useLineConfig] = createPersistableState<LineConfig>(
  STORAGE_CONFIG,
  (set) => ({
    curveType: CurveType.LineOnly,
    setCurveType: (type: CurveType) => set({ curveType: type }),
    showGrid: true,
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    hasYLogScale: false,
    toggleYLogScale: () =>
      set((state) => ({ hasYLogScale: !state.hasYLogScale })),
  })
);
