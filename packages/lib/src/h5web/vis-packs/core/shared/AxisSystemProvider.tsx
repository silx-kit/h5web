import type { ReactNode } from 'react';
import type { AxisConfig } from '../models';
import { useVisSize } from '../hooks';
import { AxisSystemContext } from './AxisSystemContext';
import { getCanvasScale } from '../utils';

interface Props {
  visRatio?: number;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  children: ReactNode;
}

function AxisSystemProvider(props: Props) {
  const { visRatio, abscissaConfig, ordinateConfig, children } = props;

  const visSize = useVisSize(visRatio);
  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  return (
    <AxisSystemContext.Provider
      value={{
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        visSize,
      }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export type { Props as AxisSystemProviderProps };
export default AxisSystemProvider;
