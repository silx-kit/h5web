import create from 'zustand';
import { combine } from 'zustand/middleware';

interface NxSpectrumConfig {
  showErrors: boolean;
  areErrorsDisabled: boolean;
}

const INITIAL_STATE: NxSpectrumConfig = {
  showErrors: true,
  areErrorsDisabled: false,
};

export const useNxSpectrumConfig = create(
  combine({ ...INITIAL_STATE }, (set) => ({
    toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
    disableErrors: (areErrorsDisabled: boolean) => set({ areErrorsDisabled }),
  }))
);
