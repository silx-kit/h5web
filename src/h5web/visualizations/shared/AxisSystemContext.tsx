import { createContext } from 'react';
import { AxisConfig } from './models';

export interface AxisConfigs {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

export default createContext<AxisConfigs>({} as AxisConfigs);
