import type {
  ScaleLinear,
  ScaleSymLog,
  scaleSymlog,
  scaleLinear,
} from 'd3-scale';

export type Size = { width: number; height: number };

export type Domain = [number, number];

export interface IndexAxisConfig {
  indexDomain: Domain;
  showGrid?: boolean;
  isLog?: never; // invalid
}

export interface DataAxisConfig {
  dataDomain: Domain;
  showGrid?: boolean;
  isLog?: boolean;
}

export type AxisConfig = IndexAxisConfig | DataAxisConfig;

export type AxisScaleFn = typeof scaleSymlog | typeof scaleLinear;

export type AxisScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;

export interface AxisInfo {
  isIndexAxis: boolean;
  scaleFn: AxisScaleFn;
  domain: Domain;
  isLog: boolean;
  showGrid: boolean;
}

export type AxisOffsets = {
  left: number;
  bottom: number;
  right: number;
  top: number;
};
