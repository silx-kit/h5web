import {
  ScaleLinear,
  ScaleLogarithmic,
  ScaleSymLog,
  scaleLog,
  scaleLinear,
  scaleSymlog,
} from 'd3-scale';
import type { HDF5Entity } from '../../providers/models';

export interface VisContainerProps {
  entity: HDF5Entity;
}

export enum ScaleType {
  Linear = 'Linear',
  Log = 'Log',
  SymLog = 'SymLog',
}

export const SCALE_FUNCTIONS: Record<ScaleType, ScaleFn> = {
  [ScaleType.Linear]: scaleLinear,
  [ScaleType.Log]: scaleLog,
  [ScaleType.SymLog]: scaleSymlog,
};

export type Size = { width: number; height: number };

export type Domain = [number, number];

export interface AxisConfig {
  isIndexAxis?: boolean;
  domain: Domain;
  showGrid?: boolean;
  scaleType?: ScaleType;
}

export type ScaleFn = typeof scaleLinear | typeof scaleLog | typeof scaleSymlog;

export type AxisScale =
  | ScaleLinear<number, number>
  | ScaleLogarithmic<number, number>
  | ScaleSymLog<number, number>;

export interface AxisInfo {
  onlyIntegers?: boolean;
  scaleFn: ScaleFn;
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
