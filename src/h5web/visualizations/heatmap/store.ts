/* eslint-disable no-param-reassign */
import { extent } from 'd3-array';
import {
  ScaleLinear,
  ScaleSymLog,
  scaleSymlog,
  scaleLinear,
  ScaleSequential,
  scaleSequential,
} from 'd3-scale';
import create from 'zustand';
import { INTERPOLATORS } from './interpolators';

export type Domain = [number, number];
export type ColorMap = keyof typeof INTERPOLATORS;
export type D3Interpolator = (t: number) => string;
export type ColorScale = ScaleSequential<string>;
export type DataScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;

export interface HeatmapState {
  domain?: Domain;
  findDomain: (values: number[]) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  hasLogScale: boolean;
  toggleLogScale: () => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;
}

export const [useHeatmapStore] = create<HeatmapState>(set => ({
  domain: undefined,
  findDomain: (values: number[]) => {
    const [min, max] = extent(values);
    set({
      domain: min === undefined || max === undefined ? undefined : [min, max],
    });
  },

  colorMap: 'Magma',
  setColorMap: (colorMap: ColorMap) => set({ colorMap }),

  hasLogScale: false,
  toggleLogScale: () => set(state => ({ hasLogScale: !state.hasLogScale })),

  keepAspectRatio: true,
  toggleAspectRatio: () =>
    set(state => ({ keepAspectRatio: !state.keepAspectRatio })),
}));

export function selectInterpolator(state: HeatmapState): D3Interpolator {
  return INTERPOLATORS[state.colorMap];
}

export function selectColorScale(state: HeatmapState): ColorScale {
  return scaleSequential(selectInterpolator(state));
}

export function selectDataScale(state: HeatmapState): DataScale | undefined {
  if (state.domain === undefined) {
    return undefined;
  }

  const scale = (state.hasLogScale ? scaleSymlog : scaleLinear)();
  scale.domain(state.domain);
  // Extend the domain to "nice" values to have nice ticks afterwards
  scale.nice();

  return scale;
}
