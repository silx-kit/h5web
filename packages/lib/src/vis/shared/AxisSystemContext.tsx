import { createContext, useContext } from 'react';
import type { Vector2, Vector3 } from 'three';

import type { AxisConfig, AxisScale, Size } from '../models';

export interface AxisSystemParams {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  dataToWorld: (vec: Vector2 | Vector3) => Vector2;
  worldToData: (vec: Vector2 | Vector3) => Vector2;
  visSize: Size;
}

export const AxisSystemContext = createContext<AxisSystemParams>(
  {} as AxisSystemParams
);

export function useAxisSystemContext() {
  return useContext(AxisSystemContext);
}
