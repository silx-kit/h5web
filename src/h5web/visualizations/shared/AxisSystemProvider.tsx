import React, { ReactElement, ReactNode, createContext } from 'react';
import { scaleLinear } from 'd3-scale';
import { AxisConfig, AxisInfo, ScaleType, SCALE_FUNCTIONS } from './models';
import { isIndexAxisConfig } from './utils';

export interface AxisInfos {
  abscissaInfo: AxisInfo;
  ordinateInfo: AxisInfo;
}

export const AxisSystemContext = createContext<AxisInfos>({} as AxisInfos);

function getAxisInfo(config: AxisConfig): AxisInfo {
  if (isIndexAxisConfig(config)) {
    const { indexDomain, showGrid = false } = config;
    return {
      isIndexAxis: true,
      scaleFn: scaleLinear,
      domain: indexDomain,
      scaleType: ScaleType.Linear,
      showGrid,
    };
  }

  const { dataDomain, scaleType = ScaleType.Linear, showGrid = false } = config;
  return {
    isIndexAxis: false,
    scaleFn: SCALE_FUNCTIONS[scaleType],
    domain: dataDomain,
    scaleType,
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
