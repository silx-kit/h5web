import { PickD3Scale } from '@visx/scale';

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  SymLog = 'symlog',
}

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

export type AxisScale = PickD3Scale<
  ScaleType.Linear | ScaleType.Log | ScaleType.SymLog,
  number,
  number
>;

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

export type AxisMapping = (AxisParams | undefined)[];

export type Bounds = [number, number, number];
