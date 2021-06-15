import { createContext, useContext } from 'react';
import type { AxisConfig, AxisScale, Size } from '../models';

interface AxisSystemParams {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  visSize: Size;
}

export const AxisSystemContext = createContext<AxisSystemParams>(
  {} as AxisSystemParams
);

export function useAxisSystemContext() {
  return useContext(AxisSystemContext);
}
