import type {
  ScaleLinear,
  ScaleLogarithmic,
  ScaleSymLog,
  scaleLog,
  scaleLinear,
  scaleSymlog,
} from 'd3-scale';

export enum ScaleType {
  Linear = 'Linear',
  Log = 'Log',
  SymLog = 'SymLog',
}

export type Size = { width: number; height: number };

export type Domain = [number, number];

export interface IndexAxisConfig {
  indexDomain: Domain;
  showGrid?: boolean;
  scaleType?: never; // invalid
}

export interface DataAxisConfig {
  dataDomain: Domain;
  showGrid?: boolean;
  scaleType?: ScaleType;
}

export type AxisConfig = IndexAxisConfig | DataAxisConfig;

export type AxisScaleFn =
  | typeof scaleLinear
  | typeof scaleLog
  | typeof scaleSymlog;

export type AxisScale =
  | ScaleLinear<number, number>
  | ScaleLogarithmic<number, number>
  | ScaleSymLog<number, number>;

export interface AxisInfo {
  isIndexAxis: boolean;
  scaleFn: AxisScaleFn;
  domain: Domain;
  scaleType: ScaleType;
  showGrid: boolean;
}

export type AxisOffsets = {
  left: number;
  bottom: number;
  right: number;
  top: number;
};
