import { combine } from 'zustand/middleware';
import { createPersistableState, StorageConfig } from '../../../storage-utils';

interface NxSpectrumConfig {
  showErrors: boolean;
  areErrorsDisabled: boolean;
}

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:nxSpectrum',
  itemsToPersist: ['showErrors'],
};

const INITIAL_STATE: NxSpectrumConfig = {
  showErrors: true,
  areErrorsDisabled: false,
};

export const useNxSpectrumConfig = createPersistableState(
  STORAGE_CONFIG,
  combine({ ...INITIAL_STATE }, (set) => ({
    toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
    disableErrors: (areErrorsDisabled: boolean) => set({ areErrorsDisabled }),
  }))
);
