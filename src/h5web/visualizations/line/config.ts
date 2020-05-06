import { StorageConfig, createPersistableState } from '../../storage-utils';

type LineVisConfig = {};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: [],
};

export const [useLineVisConfig] = createPersistableState<LineVisConfig>(
  STORAGE_CONFIG,
  () => ({})
);
