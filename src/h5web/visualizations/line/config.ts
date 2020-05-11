import { StorageConfig, createPersistableState } from '../../storage-utils';

type LineConfig = {
  showGrid: boolean;
  toggleGrid: () => void;
  hasYLogScale: boolean;
  toggleYLogScale: () => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['showGrid', 'hasYLogScale'],
};

export const [useLineConfig] = createPersistableState<LineConfig>(
  STORAGE_CONFIG,
  set => ({
    showGrid: true,
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
    hasYLogScale: false,
    toggleYLogScale: () =>
      set(state => ({ hasYLogScale: !state.hasYLogScale })),
  })
);
