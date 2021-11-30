import { CurveType } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

import type { ConfigProviderProps } from '../../models';

interface LineConfig {
  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: ScaleType;
  yScaleType: ScaleType;
  setXScaleType: (type: ScaleType) => void;
  setYScaleType: (type: ScaleType) => void;

  autoScale: boolean;
  toggleAutoScale: () => void;

  showErrors: boolean;
  toggleErrors: () => void;
}

function createStore() {
  return create<LineConfig>(
    persist(
      (set) => ({
        curveType: CurveType.LineOnly,
        setCurveType: (type: CurveType) => set({ curveType: type }),

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (type: ScaleType) => set({ xScaleType: type }),
        setYScaleType: (type: ScaleType) => set({ yScaleType: type }),

        autoScale: true,
        toggleAutoScale: () => {
          set((state) => ({ autoScale: !state.autoScale }));
        },

        showErrors: true,
        toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
      }),
      {
        name: 'h5web:line',
        whitelist: [
          'curveType',
          'showGrid',
          'xScaleType',
          'yScaleType',
          'showErrors',
        ],
        version: 4,
      }
    )
  );
}

const { Provider, useStore } = createContext<LineConfig>();
export const useLineConfig = useStore;

export function LineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
