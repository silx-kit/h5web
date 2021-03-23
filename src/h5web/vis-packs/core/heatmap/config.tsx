import create, {
  EqualityChecker,
  State,
  StateSelector,
  UseStore,
} from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorMap } from './models';
import { CustomDomain, Domain, ScaleType } from '../models';
import { createContext, useContext, useState } from 'react';
import { assertDefined } from '../../../guards';
import type { ConfigProviderProps } from '../../models';

interface HeatmapConfig extends State {
  dataDomain: Domain | undefined;
  setDataDomain: (dataDomain: Domain) => void;

  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;

  showGrid: boolean;
  toggleGrid: () => void;
}

function initialiseStore() {
  return create<HeatmapConfig>(
    persist(
      (set) => ({
        dataDomain: undefined,
        setDataDomain: (dataDomain: Domain) => set({ dataDomain }),

        customDomain: [null, null],
        setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap: ColorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () =>
          set((state) => ({ invertColorMap: !state.invertColorMap })),

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType: ScaleType) => {
          set((state) =>
            state.scaleType !== scaleType
              ? { scaleType, dataDomain: undefined } // clear `dataDomain` to avoid stale state
              : state
          );
        },

        keepAspectRatio: true,
        toggleAspectRatio: () =>
          set((state) => ({ keepAspectRatio: !state.keepAspectRatio })),

        showGrid: false,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      }),
      {
        name: 'h5web:heatmap',
        whitelist: [
          'customDomain',
          'colorMap',
          'scaleType',
          'keepAspectRatio',
          'showGrid',
          'invertColorMap',
        ],
        version: 6,
      }
    )
  );
}

const context = createContext<UseStore<HeatmapConfig> | undefined>(undefined);
const { Provider } = context;

export function useHeatmapConfig<U>(
  selector: StateSelector<HeatmapConfig, U>,
  equalityFn?: EqualityChecker<U>
): U {
  const useStore = useContext(context);
  assertDefined(useStore);

  return useStore(selector, equalityFn);
}

// https://github.com/pmndrs/zustand/issues/128#issuecomment-673398578
export function HeatmapConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  const [useStore] = useState(initialiseStore); // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state

  return <Provider value={useStore}>{children}</Provider>;
}
