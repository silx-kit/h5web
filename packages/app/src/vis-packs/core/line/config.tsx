import { CurveType, type CustomDomain, Interpolation } from '@h5web/lib';
import {
  type AxisScaleType,
  type ComplexLineVisType,
  ComplexVisType,
  type NoProps,
  ScaleType,
} from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { useSuggestion } from '../hooks';

export interface LineConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;

  xScaleType: AxisScaleType;
  yScaleType: AxisScaleType;
  setXScaleType: (type: AxisScaleType) => void;
  setYScaleType: (type: AxisScaleType) => void;

  complexVisType: ComplexLineVisType;
  setComplexVisType: (visType: ComplexLineVisType) => void;

  showErrors: boolean;
  setShowErrors: (showErrors: boolean) => void;

  interpolation: Interpolation;
  setInterpolation: (interpolation: Interpolation) => void;
}

function createLineConfigStore() {
  return createStore<LineConfig>()(
    persist(
      (set): LineConfig => ({
        customDomain: [null, null],
        setCustomDomain: (customDomain) => set({ customDomain }),

        curveType: CurveType.LineOnly,
        setCurveType: (curveType) => set({ curveType }),

        showGrid: true,
        setShowGrid: (showGrid) => set({ showGrid }),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (xScaleType) => set({ xScaleType }),
        setYScaleType: (yScaleType) => set({ yScaleType }),

        complexVisType: ComplexVisType.Amplitude,
        setComplexVisType: (complexVisType) => set(() => ({ complexVisType })),

        showErrors: true,
        setShowErrors: (showErrors) => set({ showErrors }),

        interpolation: Interpolation.Linear,
        setInterpolation: (interpolation) => set({ interpolation }),
      }),
      {
        name: 'h5web:line',
        version: 8,
      },
    ),
  );
}

const StoreContext = createContext({} as StoreApi<LineConfig>);

export function LineConfigProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createLineConfigStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useLineConfig(
  suggestions: Partial<Pick<LineConfig, 'xScaleType' | 'yScaleType'>> = {},
): LineConfig {
  const config = useStore(useContext(StoreContext));

  const [xScaleType, setXScaleType] = useSuggestion(
    suggestions.xScaleType,
    config.xScaleType,
    config.setXScaleType,
  );

  const [yScaleType, setYScaleType] = useSuggestion(
    suggestions.yScaleType,
    config.yScaleType,
    config.setYScaleType,
  );

  return { ...config, xScaleType, yScaleType, setXScaleType, setYScaleType };
}
