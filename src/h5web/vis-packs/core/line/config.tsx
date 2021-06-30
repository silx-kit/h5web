import create from 'zustand';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';
import { CurveType } from './models';
import { ScaleType } from '../models';
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
  isAutoScaleDisabled: boolean;
  toggleAutoScale: () => void;
  disableAutoScale: (isAutoScaleDisabled: boolean) => void;

  showErrors: boolean;
  areErrorsDisabled: boolean;
  toggleErrors: () => void;
  disableErrors: (areErrorsDisabled: boolean) => void;
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

        autoScale: false,
        isAutoScaleDisabled: false,
        toggleAutoScale: () => {
          set((state) => ({ autoScale: !state.autoScale }));
        },
        disableAutoScale: (isAutoScaleDisabled: boolean) => {
          set({ isAutoScaleDisabled });
        },

        showErrors: true,
        areErrorsDisabled: false,
        toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),
        disableErrors: (areErrorsDisabled: boolean) => {
          set({ areErrorsDisabled });
        },
      }),
      {
        name: 'h5web:line',
        whitelist: [
          'curveType',
          'showGrid',
          'xScaleType',
          'yScaleType',
          'autoScale',
          'showErrors',
        ],
        version: 2,
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
