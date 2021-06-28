import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { Layout } from '../heatmap/models';
import { useState } from 'react';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';
import { ImageType } from './models';

interface RgbVisConfig {
  showGrid: boolean;
  toggleGrid: () => void;

  layout: Layout;
  setLayout: (layout: Layout) => void;

  imageType: ImageType;
  setImageType: (channels: ImageType) => void;
}

function initialiseStore() {
  return create<RgbVisConfig>(
    persist(
      (set) => ({
        showGrid: false,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        layout: 'cover',
        setLayout: (layout: Layout) => set({ layout }),

        imageType: ImageType.RGB,
        setImageType: (imageType: ImageType) => set({ imageType }),
      }),
      {
        name: 'h5web:rgb',
        whitelist: ['showGrid', 'layout', 'imageType'],
        version: 1,
      }
    )
  );
}

const { Provider, useStore } = createContext<RgbVisConfig>();
export const useRgbVisConfig = useStore;

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function RgbVisConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [store] = useState(() => initialiseStore());

  return <Provider initialStore={store}>{children}</Provider>;
}
