import { ImageType } from '@h5web/lib';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';

export interface RgbVisConfig {
  showGrid: boolean;
  toggleGrid: () => void;

  keepRatio: boolean;
  toggleKeepRatio: () => void;

  imageType: ImageType;
  setImageType: (channels: ImageType) => void;

  flipXAxis: boolean;
  toggleXAxisFlip: () => void;

  flipYAxis: boolean;
  toggleYAxisFlip: () => void;
}

function createRgbConfigStore() {
  return createStore<RgbVisConfig>()(
    persist(
      (set): RgbVisConfig => ({
        showGrid: false,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        keepRatio: true,
        toggleKeepRatio: () =>
          set((state) => ({ keepRatio: !state.keepRatio })),

        imageType: ImageType.RGB,
        setImageType: (imageType) => set({ imageType }),

        flipXAxis: false,
        toggleXAxisFlip: () =>
          set((state) => ({ flipXAxis: !state.flipXAxis })),

        flipYAxis: true,
        toggleYAxisFlip: () =>
          set((state) => ({ flipYAxis: !state.flipYAxis })),
      }),
      {
        name: 'h5web:rgb',
        version: 3,
      },
    ),
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
