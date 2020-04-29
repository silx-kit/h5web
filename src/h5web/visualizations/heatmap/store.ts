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
  dataDomain?: Domain;
  customDomain?: Domain;
  findDataDomain: (values: number[]) => void;
  setCustomDomain: (customDomain: Domain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  hasLogScale: boolean;
  toggleLogScale: () => void;

  keepAspectRatio: boolean;
  toggleAspectRatio: () => void;
}

export const [useHeatmapStore] = create<HeatmapState>(set => ({
  customDomain: undefined,
  findDataDomain: (values: number[]) => {
    const [min, max] = extent(values);
    const dataDomain: Domain | undefined =
      min === undefined || max === undefined ? undefined : [min, max];
    set({
      dataDomain,
      customDomain: dataDomain && [dataDomain[0], dataDomain[1]],
    });
  },
  setCustomDomain: (customDomain: Domain) => set({ customDomain }),

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

export function selectGetExtendedDomain(
  state: HeatmapState
): (n: number) => Domain | undefined {
  return (extendPercentage: number) => {
    if (state.dataDomain === undefined) {
      return undefined;
    }
    const domainExtension =
      extendPercentage * (state.dataDomain[1] - state.dataDomain[0]);

    return [
      state.dataDomain[0] - domainExtension,
      state.dataDomain[1] + domainExtension,
    ];
  };
}

export function selectColorScale(state: HeatmapState): ColorScale {
  return scaleSequential(selectInterpolator(state));
}

export function selectDataScale(state: HeatmapState): DataScale | undefined {
  if (state.customDomain === undefined) {
    return undefined;
  }

  const scale = (state.hasLogScale ? scaleSymlog : scaleLinear)();
  scale.domain(state.customDomain);

  return scale;
}
