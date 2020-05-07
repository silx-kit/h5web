import { StorageConfig, createPersistableState } from '../../storage-utils';

type LineConfig = {
  showGrid: boolean;
  toggleGrid: () => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['showGrid'],
};

export const [useLineConfig] = createPersistableState<LineConfig>(
  STORAGE_CONFIG,
  set => ({
    showGrid: true,
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  })
);
