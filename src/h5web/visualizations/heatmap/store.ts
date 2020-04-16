/* eslint-disable no-param-reassign */
import {
  createContextStore,
  Action,
  State,
  action,
  Actions,
  Computed,
  computed,
} from 'easy-peasy';
import { ColorMap, INTERPOLATORS } from './interpolators';

export type D3Interpolator = (t: number) => string;

interface HeatmapState {
  colorMap: ColorMap;
  setColorMap: Action<HeatmapState, ColorMap>;

  hasLogScale: boolean;
  toggleLogScale: Action<HeatmapState>;

  interpolator: Computed<HeatmapState, D3Interpolator>;
}

export const HeatmapStore = createContextStore<HeatmapState>({
  colorMap: 'Magma',
  setColorMap: action((state, colorMap) => {
    state.colorMap = colorMap;
  }),

  hasLogScale: false,
  toggleLogScale: action(state => {
    state.hasLogScale = !state.hasLogScale;
  }),

  interpolator: computed(state => INTERPOLATORS[state.colorMap]),
});

export function useHeatmapState(): State<HeatmapState> {
  return HeatmapStore.useStoreState(state => state);
}

export function useHeatmapActions(): Actions<HeatmapState> {
  return HeatmapStore.useStoreActions(actions => actions);
}
