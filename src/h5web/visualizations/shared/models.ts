import { ScaleLinear, ScaleSymLog, scaleSymlog, scaleLinear } from 'd3-scale';

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

export interface AxisScale {
  scale: DataScale;
  scaleFn: DataScaleFn;
  domain: Domain;
}

export type AxisOffsets = {
  left: number;
  bottom: number;
  right: number;
  top: number;
};

export type DataScaleFn = typeof scaleSymlog | typeof scaleLinear;

export type DataScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;
