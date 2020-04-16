/* eslint-disable no-param-reassign */
import { createContextStore, Action, State, action, Actions } from 'easy-peasy';
import { ColorMap } from './interpolators';

interface HeatmapState {
  colorMap: ColorMap;
  setColorMap: Action<HeatmapState, ColorMap>;

  hasLogScale: boolean;
  toggleLogScale: Action<HeatmapState>;
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
});

export function useHeatmapState(): State<HeatmapState> {
  return HeatmapStore.useStoreState(state => state);
}

export function useHeatmapActions(): Actions<HeatmapState> {
  return HeatmapStore.useStoreActions(actions => actions);
}
