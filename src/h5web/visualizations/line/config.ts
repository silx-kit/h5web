import { StorageConfig, createPersistableState } from '../../storage-utils';

type LineVisConfig = {
  showGrid: boolean;
  toggleGrid: () => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:linevis',
  itemsToPersist: ['showGrid'],
};

export const [useLineVisConfig] = createPersistableState<LineVisConfig>(
  STORAGE_CONFIG,
  set => ({
    showGrid: true,
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  })
);
