import { ImageType } from '@h5web/lib';
import { type NoProps } from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RgbVisConfig {
  imageType: ImageType;
  setImageType: (channels: ImageType) => void;

  keepRatio: boolean;
  setKeepRatio: (keepRatio: boolean) => void;

  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;

  flipXAxis: boolean;
  setFlipXAxis: (flipXAxis: boolean) => void;

  flipYAxis: boolean;
  setFlipYAxis: (flipYAxis: boolean) => void;
}

function createRgbConfigStore() {
  return createStore<RgbVisConfig>()(
    persist(
      (set): RgbVisConfig => ({
        imageType: ImageType.RGB,
        setImageType: (imageType) => set({ imageType }),

        keepRatio: true,
        setKeepRatio: (keepRatio) => set({ keepRatio }),

        showGrid: false,
        setShowGrid: (showGrid) => set({ showGrid }),

        flipXAxis: false,
        setFlipXAxis: (flipXAxis) => set({ flipXAxis }),

        flipYAxis: true,
        setFlipYAxis: (flipYAxis) => set({ flipYAxis }),
      }),
      {
        name: 'h5web:rgb',
        version: 3,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<RgbVisConfig>);

export function RgbConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createRgbConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useRgbConfig(): RgbVisConfig {
  return useStore(useContext(StoreContext));
}
