import { createContext, useContext } from 'react';
import type { Vector2, Vector3 } from 'three';

import type { ModifierKey } from '../../interactions/models';
import type { AxisConfig, AxisScale, Size } from '../models';

export interface AxisSystemParams {
  visSize: Size;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  dataToWorld: (vec: Vector2 | Vector3) => Vector2;
  worldToData: (vec: Vector2 | Vector3) => Vector2;
  worldToHtml: (vec: Vector2 | Vector3) => Vector2;
  shouldInteract: (id: string, event: MouseEvent) => boolean;
  getModifierKey: (id: string) => ModifierKey | undefined;
}

export const AxisSystemContext = createContext<AxisSystemParams>(
  {} as AxisSystemParams
);

export function useAxisSystemContext() {
  return useContext(AxisSystemContext);
}
