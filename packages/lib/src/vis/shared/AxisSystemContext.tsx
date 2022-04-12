import { createContext, useContext } from 'react';
import type { Matrix4, Vector2, Vector3 } from 'three';

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

  // For internal use only
  cameraToHtmlMatrix: Matrix4;
  floatingToolbar: HTMLDivElement | undefined;
  registerInteraction: (id: string, value: Interaction) => void;
  unregisterInteraction: (id: string) => void;
  shouldInteract: (id: string, event: MouseEvent) => boolean;
}

export const AxisSystemContext = createContext({} as AxisSystemParams);

export function useAxisSystemContext() {
  return useContext(AxisSystemContext);
}
