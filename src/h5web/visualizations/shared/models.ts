import { ScaleLinear, ScaleSymLog, scaleSymlog, scaleLinear } from 'd3-scale';

export type Domain = [number, number];

export type Size = { width: number; height: number };

export type AxisOffsets = {
  left: number;
  bottom: number;
  right: number;
  top: number;
};

export interface AxisDomains {
  x: Domain;
  y: Domain;
}

export type DataScaleFn = typeof scaleSymlog | typeof scaleLinear;

export type DataScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;
