import { createContext } from 'react';
import type { AxisConfig, AxisScale, Size } from '../models';

interface AxisSystemParams {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  visSize: Size;
}

export default createContext<AxisSystemParams>({} as AxisSystemParams);
