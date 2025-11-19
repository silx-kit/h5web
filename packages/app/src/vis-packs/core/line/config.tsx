import { CurveType, type CustomDomain, Interpolation } from '@h5web/lib';
import { isDefined } from '@h5web/shared/guards';
import {
  type AxisScaleType,
  type ComplexLineVisType,
  ComplexVisType,
  ScaleType,
} from '@h5web/shared/vis-models';
import { useMap } from '@react-hookz/web';
import { createContext, useContext, useState } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ConfigProviderProps } from '../../models';

export interface LineConfig {
  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  curveType: CurveType;
  setCurveType: (type: CurveType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  xScaleType: AxisScaleType;
  yScaleType: AxisScaleType;
  setXScaleType: (type: AxisScaleType) => void;
  setYScaleType: (type: AxisScaleType) => void;

  complexVisType: ComplexLineVisType;
  setComplexVisType: (visType: ComplexLineVisType) => void;

  showErrors: boolean;
  toggleErrors: () => void;

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
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        xScaleType: ScaleType.Linear,
        yScaleType: ScaleType.Linear,
        setXScaleType: (xScaleType) => set({ xScaleType }),
        setYScaleType: (yScaleType) => set({ yScaleType }),

        complexVisType: ComplexVisType.Amplitude,
        setComplexVisType: (complexVisType) => set(() => ({ complexVisType })),

        showErrors: true,
        toggleErrors: () => set((state) => ({ showErrors: !state.showErrors })),

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

export function LineConfigProvider(props: ConfigProviderProps) {
  const { children } = props;

  const [store] = useState(createLineConfigStore);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useLineConfig(
  initialSuggestedOpts: Partial<
    Pick<LineConfig, 'xScaleType' | 'yScaleType'>
  > = {},
): LineConfig {
  const suggestedOpts = useMap(
    Object.entries(initialSuggestedOpts).filter(([, val]) => isDefined(val)),
  );

  const persistedConfig = useStore(useContext(StoreContext));
  const {
    setXScaleType: setPersistedXScaleType,
    setYScaleType: setPersistedYScaleType,
  } = persistedConfig;

  return {
    ...persistedConfig,
    ...Object.fromEntries(suggestedOpts.entries()),
    setXScaleType: (xScaleType: AxisScaleType) => {
      setPersistedXScaleType(xScaleType);
      suggestedOpts.delete('xScaleType');
    },
    setYScaleType: (yScaleType: AxisScaleType) => {
      setPersistedYScaleType(yScaleType);
      suggestedOpts.delete('yScaleType');
    },
  };
}
