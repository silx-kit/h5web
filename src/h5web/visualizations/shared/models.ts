import {
  ScaleLinear,
  ScaleLogarithmic,
  ScaleSymLog,
  scaleLog,
  scaleLinear,
  scaleSymlog,
} from 'd3-scale';

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  SymLog = 'symlog',
}

export const SCALE_FUNCTIONS: Record<ScaleType, ScaleFn> = {
  [ScaleType.Linear]: scaleLinear,
  [ScaleType.Log]: scaleLog,
  [ScaleType.SymLog]: scaleSymlog,
};

export interface Size {
  width: number;
  height: number;
}

export type Domain = [number, number];

export interface AxisConfig {
  isIndexAxis?: boolean;
  domain: Domain;
  showGrid?: boolean;
  scaleType?: ScaleType;
  label?: string;
}

export type ScaleFn = typeof scaleLinear | typeof scaleLog | typeof scaleSymlog;

export type AxisScale =
  | ScaleLinear<number, number>
  | ScaleLogarithmic<number, number>
  | ScaleSymLog<number, number>;

export interface AxisOffsets {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

export interface AxisParams {
  label?: string;
  value?: number[];
  scaleType?: ScaleType;
}

export type AxisMapping = AxisParams | undefined;
