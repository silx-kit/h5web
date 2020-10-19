import React, { ReactElement, ReactNode, createContext } from 'react';
import { scaleLinear } from 'd3-scale';
import { AxisConfig, AxisInfo, ScaleType, SCALE_FUNCTIONS } from './models';

export interface AxisInfos {
  abscissaInfo: AxisInfo;
  ordinateInfo: AxisInfo;
}

export const AxisSystemContext = createContext<AxisInfos>({} as AxisInfos);

function getAxisInfo(config: AxisConfig): AxisInfo {
  const {
    domain,
    scaleType = ScaleType.Linear,
    isIndexAxis,
    showGrid = false,
  } = config;

  return {
    onlyIntegers: isIndexAxis,
    scaleFn: isIndexAxis ? scaleLinear : SCALE_FUNCTIONS[scaleType],
    scaleType: isIndexAxis ? ScaleType.Linear : scaleType,
    showGrid,
    domain,
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
