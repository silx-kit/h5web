import React, { ReactElement, ReactNode, createContext } from 'react';
import { scaleLinear, scaleSymlog } from 'd3-scale';
import { AxisConfig, AxisInfo } from './models';
import { isIndexAxisConfig } from './utils';

export interface AxisConfigs {
  abscissaInfo: AxisInfo;
  ordinateInfo: AxisInfo;
}

export const AxisSystemContext = createContext<AxisConfigs>({} as AxisConfigs);

function getAxisInfo(config: AxisConfig): AxisInfo {
  if (isIndexAxisConfig(config)) {
    const { indexDomain, showGrid = false } = config;
    return {
      isIndexAxis: true,
      scaleFn: scaleLinear,
      domain: indexDomain,
      isLog: false,
      showGrid,
    };
  }

  const { dataDomain, isLog = false, showGrid = false } = config;
  return {
    isIndexAxis: false,
    scaleFn: isLog ? scaleSymlog : scaleLinear,
    domain: dataDomain,
    isLog,
    showGrid,
  };
}

type Props = {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  children: ReactNode;
};

function AxisSystemProvider(props: Props): ReactElement {
  const { abscissaConfig, ordinateConfig, children } = props;

  const abscissaInfo = getAxisInfo(abscissaConfig);
  const ordinateInfo = getAxisInfo(ordinateConfig);

  return (
    <AxisSystemContext.Provider value={{ abscissaInfo, ordinateInfo }}>
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
