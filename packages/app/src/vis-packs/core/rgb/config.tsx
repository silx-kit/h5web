import { ImageType } from '@h5web/lib';
import type { StoreApi } from 'zustand';
import create from 'zustand';
import createContext from 'zustand/context';
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

function createStore() {
  return create<RgbVisConfig>()(
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

const { Provider, useStore } = createContext<StoreApi<RgbVisConfig>>();
export { useStore as useRgbConfig };

export function RgbConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
