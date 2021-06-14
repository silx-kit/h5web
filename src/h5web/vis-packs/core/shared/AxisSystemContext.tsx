import { createContext } from 'react';
import type { AxisConfig, Size } from '../models';

interface AxisConfigs {
  visSize: Size;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

export default createContext<AxisConfigs>({} as AxisConfigs);
