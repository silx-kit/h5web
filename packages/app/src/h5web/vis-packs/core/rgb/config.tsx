import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';
import { ImageType } from '@h5web/lib/src/h5web/vis-packs/core/rgb/models';
import type { Layout } from '../heatmap/models';
import type { ConfigProviderProps } from '../../models';

interface RgbVisConfig {
  showGrid: boolean;
  toggleGrid: () => void;

  layout: Layout;
  setLayout: (layout: Layout) => void;

  imageType: ImageType;
  setImageType: (channels: ImageType) => void;
}

function createStore() {
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

export function RgbConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
