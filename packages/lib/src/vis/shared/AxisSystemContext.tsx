import { createContext, useContext } from 'react';
import type { Vector2, Vector3 } from 'three';

import type { Interaction } from '../../interactions/models';
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
  floatingToolbar: HTMLDivElement | undefined;
  shouldInteract: (id: string, event: MouseEvent) => boolean;
  registerInteraction: (id: string, value: Interaction) => void;
  unregisterInteraction: (id: string) => void;
}

export const AxisSystemContext = createContext<AxisSystemParams>(
  {} as AxisSystemParams
);

export function useAxisSystemContext() {
  return useContext(AxisSystemContext);
}
