import create, { State } from 'zustand';
import { persist } from 'zustand/middleware';

interface NxSpectrumConfig extends State {
  showErrors: boolean;
  areErrorsDisabled: boolean;
  toggleErrors: () => void;
  disableErrors: (areErrorsDisabled: boolean) => void;
}

export const useNxSpectrumConfig = create<NxSpectrumConfig>(
  persist(
    (set) => ({
      showErrors: true,
      areErrorsDisabled: false,
      toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
      disableErrors: (areErrorsDisabled: boolean) => set({ areErrorsDisabled }),
    }),
    {
      name: 'h5web:nxSpectrum',
      whitelist: ['showErrors'],
      version: 1,
    }
  )
);
