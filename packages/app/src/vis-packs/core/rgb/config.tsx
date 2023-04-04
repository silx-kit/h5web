import { ImageType } from '@h5web/lib';
import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createStore, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

export interface RgbVisConfig {
  showGrid: boolean;
  toggleGrid: () => void;

  keepRatio: boolean;
  toggleKeepRatio: () => void;

  imageType: ImageType;
  setImageType: (channels: ImageType) => void;
}

function createRgbConfigStore() {
  return createStore<RgbVisConfig>()(
    persist(
      (set) => ({
        showGrid: false,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        keepRatio: true,
        toggleKeepRatio: () =>
          set((state) => ({ keepRatio: !state.keepRatio })),

        imageType: ImageType.RGB,
        setImageType: (imageType: ImageType) => set({ imageType }),
      }),
      {
        name: 'h5web:rgb',
        version: 2,
      }
    )
  );
}

const StoreContext = createContext({} as StoreApi<RgbVisConfig>);

export function RgbConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createRgbConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useRgbConfig(): RgbVisConfig {
  return useStore(useContext(StoreContext));
}
