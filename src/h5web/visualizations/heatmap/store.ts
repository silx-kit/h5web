/* eslint-disable no-param-reassign */
import { createContextStore, Action, State, action, Actions } from 'easy-peasy';
import { ColorMap } from './interpolators';

interface HeatmapState {
  colorMap: ColorMap;
  setColorMap: Action<HeatmapState, ColorMap>;
}

export const HeatmapStore = createContextStore<HeatmapState>({
  colorMap: 'Magma',
  setColorMap: action((state, colorMap) => {
    state.colorMap = colorMap;
  }),
});

export function useHeatmapState(): State<HeatmapState> {
  return HeatmapStore.useStoreState(state => state);
}

export function useHeatmapActions(): Actions<HeatmapState> {
  return HeatmapStore.useStoreActions(state => state);
}
